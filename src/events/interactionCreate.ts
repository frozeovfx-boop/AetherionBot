import {
  Events,
  ChatInputCommandInteraction,
  Collection,
  ButtonInteraction,
  ModalSubmitInteraction,
  TextChannel,
  StringSelectMenuInteraction,
  GuildMember,
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  OverwriteType,
} from "discord.js";
import { Event } from "../structures/Event.js";
import type { YutaClient } from "../client/YutaClient.js";
import { yutaFail, yutaNotice } from "../utils/embeds.js";

export default class InteractionCreateEvent extends Event<typeof Events.InteractionCreate> {
  constructor() {
    super(Events.InteractionCreate);
  }

  public async execute(
    client: YutaClient,
    interaction: ChatInputCommandInteraction | ButtonInteraction | ModalSubmitInteraction | StringSelectMenuInteraction
  ): Promise<void> {
    if (interaction.isButton() && interaction.customId.startsWith("ticket_create")) {
      await handleTicketCreate(client, interaction);
      return;
    }

    if (interaction.isButton() && interaction.customId === "ticket_close") {
      await handleTicketClose(client, interaction);
      return;
    }

    if (interaction.isButton() && interaction.customId === "ticket_claim") {
      await handleTicketClaim(interaction);
      return;
    }

    if (interaction.isButton() && interaction.customId === "ticket_close_confirm") {
      await handleTicketCloseConfirm(client, interaction);
      return;
    }

    if (interaction.isModalSubmit() && interaction.customId === "confession_modal") {
      await handleConfession(client, interaction);
      return;
    }

    if (interaction.isButton() && interaction.customId === "giveaway_luck") {
      await handleGiveawayLuck(client, interaction);
      return;
    }

    if (interaction.isButton() && interaction.customId.startsWith("sr_btn:")) {
      await handleSelfRoleButton(client, interaction);
      return;
    }

    if (interaction.isStringSelectMenu() && interaction.customId.startsWith("sr_menu:")) {
      await handleSelfRoleMenu(client, interaction);
      return;
    }

    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) {
      await interaction.reply({ embeds: [yutaFail("Komut yüklenemedi.")], ephemeral: true }).catch(() => null);
      return;
    }

    if (!client.cooldowns.has(command.name)) {
      client.cooldowns.set(command.name, new Collection());
    }

    const now = Date.now();
    const timestamps = client.cooldowns.get(command.name)!;
    const cooldownAmount = command.cooldown * 1000;

    if (timestamps.has(interaction.user.id)) {
      const expiration = timestamps.get(interaction.user.id)! + cooldownAmount;
      if (now < expiration) {
        const remaining = ((expiration - now) / 1000).toFixed(1);
        await interaction.reply({
          content: `Bu komutu tekrar kullanabilmek için **${remaining}** saniye beklemelisin.`,
          ephemeral: true,
        });
        return;
      }
    }

    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

    if (command.ownerOnly && !client.config.ownerIds.includes(interaction.user.id)) {
      await interaction.reply({ embeds: [yutaFail("Sadece bot sahibi.")], ephemeral: true });
      return;
    }

    try {
      await command.execute(client, interaction);
    } catch (error) {
      client.logger.error(error, `Error executing command ${command.name}`);
      const reply = { embeds: [yutaFail("Bir hata oluştu. Log kontrol et.")], ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(reply);
      } else {
        await interaction.reply(reply);
      }
    }
  }
}

async function handleTicketCreate(client: YutaClient, interaction: ButtonInteraction): Promise<void> {
  if (!interaction.guild || !interaction.member) return;

  const typeId = interaction.customId.includes(":")
    ? interaction.customId.split(":")[1] ?? "destek"
    : "destek";
  const cfg = client.settings.get(interaction.guild.id);
  const btnMeta =
    cfg.ticketButtons.find((b) => b.id === typeId) ??
    ({ id: typeId, label: typeId, style: "Primary" } as const);

  const existing = interaction.guild.channels.cache.find(
    (c) =>
      c.isTextBased() &&
      "topic" in c &&
      typeof (c as TextChannel).topic === "string" &&
      (c as TextChannel).topic!.startsWith(`ticket:${interaction.user.id}`)
  );

  if (existing) {
    await interaction.reply({ content: `Zaten açık ticket: ${existing}`, ephemeral: true });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  const overwrites = [
    {
      id: interaction.guild.id,
      deny: [PermissionFlagsBits.ViewChannel],
      type: OverwriteType.Role,
    },
    {
      id: interaction.user.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.AttachFiles,
        PermissionFlagsBits.ReadMessageHistory,
      ],
      type: OverwriteType.Member,
    },
    {
      id: client.user!.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ManageChannels,
        PermissionFlagsBits.ReadMessageHistory,
      ],
      type: OverwriteType.Member,
    },
  ];

  const typeRole =
    ("supportRoleId" in btnMeta && btnMeta.supportRoleId) || cfg.ticketSupportRoleId || null;
  if (typeRole) {
    overwrites.push({
      id: typeRole,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.AttachFiles,
        PermissionFlagsBits.ManageMessages,
      ],
      type: OverwriteType.Role,
    } as never);
  }

  const channel = await interaction.guild.channels.create({
    name: `ticket-${typeId}-${interaction.user.username}`.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 90),
    type: ChannelType.GuildText,
    parent: cfg.ticketCategoryId ?? undefined,
    topic: `ticket:${interaction.user.id}:${typeId}`,
    permissionOverwrites: overwrites,
    reason: `Ticket | ${interaction.user.tag}`,
  });

  const { Theme, baseEmbed, line, kv } = await import("../utils/embeds.js");
  const embed = baseEmbed(Theme.primary)
    .setAuthor({ name: "TICKET" })
    .setTitle(`${btnMeta.label}`)
    .setDescription(
      [
        line(),
        `Merhaba ${interaction.user}`,
        "Sorununu net yaz. Ekip en kısa sürede dönecek.",
        line(),
        kv("Tür", btnMeta.label),
        kv("Sahip", interaction.user.tag),
        btnMeta.description ? kv("Not", btnMeta.description) : null,
        line(),
      ]
        .filter(Boolean)
        .join("\n")
    )
    .setFooter({ text: "Yuta" });

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("ticket_claim")
      .setLabel("Üstlen")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("ticket_close")
      .setLabel("Kapat")
      .setStyle(ButtonStyle.Danger)
  );

  const pingRole =
    ("supportRoleId" in btnMeta && btnMeta.supportRoleId) || cfg.ticketSupportRoleId || null;
  const ping = pingRole
    ? `${interaction.user} · <@&${pingRole}>`
    : `${interaction.user}`;

  await channel.send({ content: ping, embeds: [embed], components: [row] });
  await interaction.editReply({ content: `Ticket açıldı: ${channel}` });
}

async function handleTicketClaim(interaction: ButtonInteraction): Promise<void> {
  if (!interaction.channel || !interaction.guild) return;
  await interaction.reply({
    embeds: [
      (await import("../utils/embeds.js")).baseEmbed((await import("../utils/embeds.js")).Theme.success)
        .setAuthor({ name: "TICKET" })
        .setDescription(`**${interaction.user.tag}** bu ticket'ı üstlendi.`),
    ],
  });
}

async function handleTicketClose(client: YutaClient, interaction: ButtonInteraction): Promise<void> {
  if (!interaction.channel || !interaction.guild) return;

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("ticket_close_confirm")
      .setLabel("Evet, kapat")
      .setStyle(ButtonStyle.Danger),
  );

  const { Theme, baseEmbed, line } = await import("../utils/embeds.js");
  await interaction.reply({
    embeds: [
      baseEmbed(Theme.warning)
        .setAuthor({ name: "TICKET" })
        .setDescription([line(), "Ticket kapatılsın mı? Transcript alınacak.", line()].join("\n")),
    ],
    components: [row],
    ephemeral: true,
  });
}

async function handleTicketCloseConfirm(
  client: YutaClient,
  interaction: ButtonInteraction
): Promise<void> {
  if (!interaction.channel || !interaction.guild || !interaction.channel.isTextBased()) return;
  if (interaction.channel.isDMBased()) return;

  await interaction.update({ content: "Kapatılıyor…", embeds: [], components: [] }).catch(() => null);

  const channel = interaction.channel as TextChannel;
  let transcript = `Ticket transcript · ${channel.name}\nGuild: ${interaction.guild.name}\nClosed by: ${interaction.user.tag}\nDate: ${new Date().toISOString()}\n${"=".repeat(40)}\n\n`;

  try {
    let lastId: string | undefined;
    const lines: string[] = [];
    for (let i = 0; i < 10; i++) {
      const batch = await channel.messages.fetch({ limit: 100, ...(lastId ? { before: lastId } : {}) });
      if (batch.size === 0) break;
      const sorted = [...batch.values()].sort((a, b) => a.createdTimestamp - b.createdTimestamp);
      for (const m of sorted) {
        const time = new Date(m.createdTimestamp).toISOString();
        lines.push(`[${time}] ${m.author.tag}: ${m.content || "[embed/ek]"}`);
      }
      lastId = batch.last()?.id;
      if (batch.size < 100) break;
    }
    transcript += lines.join("\n");
  } catch {
    transcript += "(mesajlar alınamadı)\n";
  }

  const cfg = client.settings.get(interaction.guild.id);
  const buf = Buffer.from(transcript, "utf8");
  const file = {
    attachment: buf,
    name: `transcript-${channel.name}-${Date.now()}.txt`,
  };

  if (cfg.ticketLogChannelId) {
    try {
      const logCh = await client.channels.fetch(cfg.ticketLogChannelId);
      if (logCh && logCh.isTextBased() && !logCh.isDMBased()) {
        const { Theme, baseEmbed, line, kv } = await import("../utils/embeds.js");
        await logCh.send({
          embeds: [
            baseEmbed(Theme.mute)
              .setAuthor({ name: "TICKET · KAPANDI" })
              .setDescription(
                [
                  line(),
                  kv("Kanal", channel.name),
                  kv("Kapatan", interaction.user.tag),
                  line(),
                ].join("\n")
              ),
          ],
          files: [file],
        });
      }
    } catch (err) {
      client.logger.error(err, "ticket transcript log");
    }
  }

  setTimeout(async () => {
    try {
      await channel.delete(`Ticket closed by ${interaction.user.tag}`);
    } catch {
      /* gone */
    }
  }, 2500);
}

async function handleConfession(client: YutaClient, interaction: ModalSubmitInteraction): Promise<void> {
  if (!interaction.guild) return;
  const cfg = client.settings.get(interaction.guild.id);
  if (!cfg.confessionChannelId) {
    await interaction.reply({ content: "İtiraf kanalı ayarlı değil.", ephemeral: true });
    return;
  }

  const text = interaction.fields.getTextInputValue("confession_text");
  try {
    const channel = await client.channels.fetch(cfg.confessionChannelId);
    if (!channel || !channel.isTextBased() || channel.isDMBased()) {
      await interaction.reply({ content: "Kanal bulunamadı.", ephemeral: true });
      return;
    }

    const { Theme, baseEmbed, line } = await import("../utils/embeds.js");
    await channel.send({
      embeds: [
        baseEmbed(Theme.info)
          .setAuthor({ name: "ANONİM İTİRAF" })
          .setDescription([line(), text.slice(0, 1500), line()].join("\n")),
      ],
    });

    await interaction.reply({ content: "İtirafın anonim olarak gönderildi.", ephemeral: true });
  } catch (err) {
    client.logger.error(err, "confession failed");
    await interaction.reply({ content: "Gönderilemedi.", ephemeral: true });
  }
}

async function handleSelfRoleButton(
  client: YutaClient,
  interaction: ButtonInteraction
): Promise<void> {
  // sr_btn:panelId:roleId
  const parts = interaction.customId.split(":");
  if (parts.length < 3) return;
  const panelId = parts[1]!;
  const roleId = parts[2]!;
  const panel = client.selfroles.get(panelId);
  if (!panel || !interaction.guild) {
    await interaction.reply({ content: "Panel artık yok.", ephemeral: true });
    return;
  }

  const member = interaction.member as GuildMember;
  if (!member || !("roles" in member)) {
    await interaction.reply({ content: "Üye bilgisi alınamadı.", ephemeral: true });
    return;
  }

  const role = interaction.guild.roles.cache.get(roleId);
  if (!role) {
    await interaction.reply({ content: "Rol silinmiş.", ephemeral: true });
    return;
  }

  try {
    if (member.roles.cache.has(roleId)) {
      await member.roles.remove(roleId, "Self-role toggle");
      await interaction.reply({ content: `Rol alındı: **${role.name}**`, ephemeral: true });
    } else {
      await member.roles.add(roleId, "Self-role toggle");
      await interaction.reply({ content: `Rol verildi: **${role.name}**`, ephemeral: true });
    }
  } catch {
    await interaction.reply({
      content: "Rol verilemedi. Bot rol sırasını ve yetkilerini kontrol et.",
      ephemeral: true,
    });
  }
}

async function handleSelfRoleMenu(
  client: YutaClient,
  interaction: StringSelectMenuInteraction
): Promise<void> {
  // sr_menu:panelId
  const panelId = interaction.customId.split(":")[1];
  if (!panelId) return;
  const panel = client.selfroles.get(panelId);
  if (!panel || !interaction.guild) {
    await interaction.reply({ content: "Panel artık yok.", ephemeral: true });
    return;
  }

  const member = interaction.member as GuildMember;
  if (!member || !("roles" in member)) {
    await interaction.reply({ content: "Üye bilgisi alınamadı.", ephemeral: true });
    return;
  }

  const allowed = new Set(panel.roles.map((r) => r.roleId));
  const selected = interaction.values.filter((id) => allowed.has(id));
  const current = member.roles.cache.filter((r) => allowed.has(r.id)).map((r) => r.id);

  const toAdd = selected.filter((id) => !current.includes(id));
  const toRemove = current.filter((id) => !selected.includes(id));

  try {
    if (toAdd.length) await member.roles.add(toAdd, "Self-role menu");
    if (toRemove.length) await member.roles.remove(toRemove, "Self-role menu");

    const names = selected
      .map((id) => interaction.guild!.roles.cache.get(id)?.name ?? id)
      .join(", ");
    await interaction.reply({
      content: selected.length
        ? `Rollerin güncellendi: **${names}**`
        : "Panel rolleri temizlendi.",
      ephemeral: true,
    });
  } catch {
    await interaction.reply({
      content: "Rol güncellenemedi. Bot rol sırasını kontrol et.",
      ephemeral: true,
    });
  }
}

async function handleGiveawayLuck(
  client: YutaClient,
  interaction: ButtonInteraction
): Promise<void> {
  if (!interaction.guild) return;
  const member =
    interaction.member && "roles" in interaction.member
      ? (interaction.member as GuildMember)
      : await interaction.guild.members.fetch(interaction.user.id).catch(() => null);

  const { memberLuckWeight } = await import("../utils/giveawayEnd.js");
  const { Theme, baseEmbed, line, kv, code } = await import("../utils/embeds.js");

  const weight = memberLuckWeight(client, interaction.guild.id, member);
  const luck = client.settings.get(interaction.guild.id).giveawayLuck;
  const owned = member
    ? Object.entries(luck)
        .filter(([rid]) => member.roles.cache.has(rid))
        .map(([rid, w]) => `<@&${rid}> ×${w}`)
    : [];

  await interaction.reply({
    embeds: [
      baseEmbed(Theme.economy)
        .setAuthor({
          name: interaction.user.tag,
          iconURL: interaction.user.displayAvatarURL({ size: 64 }),
        })
        .setTitle("Çekiliş şansın")
        .setDescription(
          [
            line(),
            kv("Çarpan", `**×${weight}**`),
            weight > 1
              ? "Bu çekilişte normal üyeye göre daha yüksek şans."
              : "Varsayılan şans (1×).",
            line(),
            owned.length ? `**Şanslı rollerin**\n${owned.join("\n")}` : null,
            line(),
          ]
            .filter(Boolean)
            .join("\n")
        )
        .setFooter({ text: "Yuta" }),
    ],
    ephemeral: true,
  });
}

