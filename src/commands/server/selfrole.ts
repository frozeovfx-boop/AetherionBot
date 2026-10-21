import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  TextChannel,
  ChannelType,
} from "discord.js";
import { randomBytes } from "node:crypto";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import type { SelfRoleEntry } from "../../database/SelfRoleManager.js";
import { Theme, baseEmbed, line, kv, code, yutaOk, yutaFail } from "../../utils/embeds.js";

function parseRoleList(
  interaction: ChatInputCommandInteraction,
  raw: string
): { ok: true; roles: SelfRoleEntry[] } | { ok: false; error: string } {
  const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) return { ok: false, error: "En az bir rol gerekli." };
  if (parts.length > 20) return { ok: false, error: "En fazla 20 rol." };

  const roles: SelfRoleEntry[] = [];
  const guild = interaction.guild!;

  for (const part of parts) {
    // formats: @Role | roleId | Label:roleId | Label:roleId:emoji
    let label = "";
    let roleRef = part;
    let emoji: string | undefined;

    if (part.includes(":")) {
      const segs = part.split(":").map((s) => s.trim());
      if (segs.length >= 2) {
        label = segs[0]!;
        roleRef = segs[1]!;
        emoji = segs[2];
      }
    }

    const id = roleRef.replace(/[<@&>]/g, "");
    const role = guild.roles.cache.get(id) ?? guild.roles.cache.find((r) => r.name === roleRef);
    if (!role) return { ok: false, error: `Rol bulunamadı: ${part}` };
    if (role.managed || role.id === guild.id) {
      return { ok: false, error: `Kullanılamaz rol: ${role.name}` };
    }

    roles.push({
      roleId: role.id,
      label: (label || role.name).slice(0, 80),
      emoji: emoji?.slice(0, 32),
      description: role.name.slice(0, 100),
    });
  }

  return { ok: true, roles };
}

function buildComponents(
  panelId: string,
  mode: "button" | "menu",
  roles: SelfRoleEntry[]
) {
  if (mode === "menu") {
    const menu = new StringSelectMenuBuilder()
      .setCustomId(`sr_menu:${panelId}`)
      .setPlaceholder("Rol seç…")
      .setMinValues(0)
      .setMaxValues(Math.min(roles.length, 25));

    for (const r of roles) {
      const opt = new StringSelectMenuOptionBuilder()
        .setLabel(r.label.slice(0, 100))
        .setValue(r.roleId)
        .setDescription(r.description?.slice(0, 100) ?? "Rol");
      if (r.emoji) {
        try {
          opt.setEmoji(r.emoji);
        } catch {
          /* invalid emoji */
        }
      }
      menu.addOptions(opt);
    }
    return [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu)];
  }

  // buttons — max 5 per row, max 25
  const rows: ActionRowBuilder<ButtonBuilder>[] = [];
  let row = new ActionRowBuilder<ButtonBuilder>();
  let count = 0;

  for (const r of roles.slice(0, 25)) {
    if (count > 0 && count % 5 === 0) {
      rows.push(row);
      row = new ActionRowBuilder<ButtonBuilder>();
    }
    const btn = new ButtonBuilder()
      .setCustomId(`sr_btn:${panelId}:${r.roleId}`)
      .setLabel(r.label.slice(0, 80))
      .setStyle(ButtonStyle.Secondary);
    if (r.emoji) {
      try {
        btn.setEmoji(r.emoji);
      } catch {
        /* ignore */
      }
    }
    row.addComponents(btn);
    count++;
  }
  if (row.components.length) rows.push(row);
  return rows;
}

export default class SelfroleCommand extends Command {
  constructor() {
    super({
      name: "selfrole",
      description: "Self-role panel (buton / menü)",
      category: "server",
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageRoles],
      data: new SlashCommandBuilder()
        .setName("selfrole")
        .setDescription("Self-role panel (buton / menü)")
        .addSubcommand((s) =>
          s
            .setName("panel")
            .setDescription("Yeni panel oluştur")
            .addStringOption((o) =>
              o
                .setName("mod")
                .setDescription("button veya menu")
                .setRequired(true)
                .addChoices(
                  { name: "Buton", value: "button" },
                  { name: "Menü", value: "menu" }
                )
            )
            .addStringOption((o) =>
              o
                .setName("roller")
                .setDescription("rol1, rol2 veya Etiket:rolId:emoji")
                .setRequired(true)
            )
            .addStringOption((o) =>
              o.setName("baslik").setDescription("Panel başlığı").setRequired(false)
            )
            .addStringOption((o) =>
              o.setName("aciklama").setDescription("Panel açıklaması").setRequired(false)
            )
            .addChannelOption((o) =>
              o
                .setName("kanal")
                .setDescription("Gönderilecek kanal")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false)
            )
        )
        .addSubcommand((s) => s.setName("liste").setDescription("Panelleri listele"))
        .addSubcommand((s) =>
          s
            .setName("sil")
            .setDescription("Panel sil")
            .addStringOption((o) =>
              o.setName("id").setDescription("Panel ID").setRequired(true)
            )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild || !interaction.channel) return;
    const sub = interaction.options.getSubcommand();

    if (sub === "liste") {
      const list = client.selfroles.list(interaction.guild.id);
      if (!list.length) {
        await interaction.reply({
          embeds: [yutaFail("Panel yok. `/selfrole panel`")],
          ephemeral: true,
        });
        return;
      }
      const rows = list.map(
        (p) =>
          `${code(p.id)} · ${p.mode} · ${p.roles.length} rol · <#${p.channelId}>`
      );
      await interaction.reply({
        embeds: [
          baseEmbed(Theme.primary)
            .setAuthor({ name: "SELF-ROLE" })
            .setDescription([line(), rows.join("\n"), line()].join("\n")),
        ],
        ephemeral: true,
      });
      return;
    }

    if (sub === "sil") {
      const id = interaction.options.getString("id", true);
      const panel = client.selfroles.get(id);
      if (!panel || panel.guildId !== interaction.guild.id) {
        await interaction.reply({
          embeds: [yutaFail("Panel bulunamadı.")],
          ephemeral: true,
        });
        return;
      }
      client.selfroles.remove(id);
      await interaction.reply({
        embeds: [
          baseEmbed(Theme.mute)
            .setAuthor({ name: "SELF-ROLE" })
            .setDescription(`Panel silindi: ${code(id)}`),
        ],
      });
      return;
    }

    // panel
    const mode = interaction.options.getString("mod", true) as "button" | "menu";
    const rawRoles = interaction.options.getString("roller", true);
    const title = interaction.options.getString("baslik") ?? "Roller";
    const description =
      interaction.options.getString("aciklama") ??
      "Aşağıdan rol al veya bırak. Tekrar basınca rol kalkar.";
    const channel =
      (interaction.options.getChannel("kanal") as TextChannel | null) ??
      (interaction.channel as TextChannel);

    const parsed = parseRoleList(interaction, rawRoles);
    if (!parsed.ok) {
      await interaction.reply({
        embeds: [yutaFail(parsed.error)],
        ephemeral: true,
      });
      return;
    }

    const me = interaction.guild.members.me;
    if (!me?.permissions.has(PermissionFlagsBits.ManageRoles)) {
      await interaction.reply({
        embeds: [yutaFail("Botun Manage Roles yetkisi yok.")],
        ephemeral: true,
      });
      return;
    }

    for (const r of parsed.roles) {
      const role = interaction.guild.roles.cache.get(r.roleId);
      if (role && me.roles.highest.position <= role.position) {
        await interaction.reply({
          embeds: [
            yutaFail(`Bot rolü yetersiz: **${role.name}**. Bot rolünü yukarı taşı.`),
          ],
          ephemeral: true,
        });
        return;
      }
    }

    const panelId = randomBytes(4).toString("hex");
    const embed = baseEmbed(Theme.primary)
      .setAuthor({ name: "Yuta · Self-role" })
      .setTitle(title.slice(0, 200))
      .setDescription(
        [description.slice(0, 1000), "", parsed.roles.map((r) => `▸ **${r.label}**`).join("\n")].join("\n")
      )
      .setFooter({ text: `ID ${panelId} · Yuta · v1` });

    const components = buildComponents(panelId, mode, parsed.roles);
    const msg = await channel.send({ embeds: [embed], components });

    client.selfroles.create({
      id: panelId,
      guildId: interaction.guild.id,
      channelId: channel.id,
      messageId: msg.id,
      mode,
      title,
      description,
      roles: parsed.roles,
      toggle: true,
    });

    await interaction.reply({
      embeds: [
        yutaOk(
          "Self-role panel",
          [
            kv("Panel", code(panelId)),
            kv("Mod", mode),
            kv("Kanal", `${channel}`),
            kv("Rol", code(parsed.roles.length)),
          ].join("\n")
        ),
      ],
      ephemeral: true,
    });
  }
}
