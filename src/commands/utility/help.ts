import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line } from "../../utils/embeds.js";
import { FREE_LIMITS, isGuildPremium } from "../../utils/premium.js";

const CATEGORIES: { id: string; label: string; blurb: string }[] = [
  { id: "moderation", label: "Moderasyon", blurb: "Ban · warn · case · lock" },
  { id: "server", label: "Sunucu", blurb: "Ticket · log · welcome · ayar" },
  { id: "utility", label: "Araçlar", blurb: "Info · premium · snipe" },
  { id: "economy", label: "Ekonomi", blurb: "Para · work · level" },
  { id: "music", label: "Müzik", blurb: "Play · queue · filter" },
  { id: "ai", label: "AI / Conseil", blurb: "Ask · debate · consult" },
];

const SYSTEMS: { label: string; value: string; cmd: string }[] = [
  { label: "Çekiliş", value: "sys:giveaway", cmd: "/giveaway" },
  { label: "Automod", value: "sys:automod", cmd: "/automod" },
  { label: "Ticket", value: "sys:ticket", cmd: "/ticket-setup" },
  { label: "Log", value: "sys:log", cmd: "/logset" },
  { label: "Self-role", value: "sys:selfrole", cmd: "/selfrole" },
  { label: "Özel oda", value: "sys:tempvoice", cmd: "/ozeloda" },
  { label: "Welcome", value: "sys:welcome", cmd: "/setwelcome" },
  { label: "Stat", value: "sys:stat", cmd: "/stat" },
  { label: "Davet", value: "sys:invite", cmd: "/davet" },
  { label: "Premium", value: "sys:premium", cmd: "/premium" },
  { label: "Conseil", value: "sys:conseil", cmd: "/conseil" },
  { label: "Ayarlar", value: "sys:ayarlar", cmd: "/ayarlar" },
];

const SYS_BODY: Record<string, string> = {
  "sys:giveaway": "**Çekiliş**\n`/giveaway baslat` · `sans-rol` · Şansım butonu",
  "sys:automod": "**Automod**\n`/automod` davet · link · spam · küfür",
  "sys:ticket": "**Ticket**\n`/ticket-setup panel` · buton · destek rolü",
  "sys:log": "**Log**\n`/logset` mesaj · üye · ses · davet",
  "sys:selfrole": "**Self-role**\n`/selfrole panel`",
  "sys:tempvoice": "**Özel oda**\n`/ozeloda` hub",
  "sys:welcome": "**Welcome**\n`/setwelcome`",
  "sys:stat": "**Stat**\n`/stat`",
  "sys:invite": "**Davet**\n`/davet`",
  "sys:premium": `**Premium**\n\`/premium durum\`\nLimit/gün: ask ${FREE_LIMITS.ask} · debate ${FREE_LIMITS.conseil_debate}`,
  "sys:conseil": "**Conseil**\n`/conseil` debate · consult · ozet",
  "sys:ayarlar": "**Ayarlar**\n`/ayarlar` (yetkili)",
};

function publicCommands(client: YutaClient) {
  return [...client.commands.values()].filter((c) => c.category !== "admin" && !c.ownerOnly);
}

function countMap(client: YutaClient): Map<string, number> {
  const m = new Map<string, number>();
  for (const c of publicCommands(client)) {
    m.set(c.category, (m.get(c.category) ?? 0) + 1);
  }
  return m;
}

function homeEmbed(client: YutaClient, guildId: string | null): EmbedBuilder {
  const counts = countMap(client);
  const prem = guildId ? isGuildPremium(client, guildId) : false;
  const total = publicCommands(client).length;

  const catBlock = CATEGORIES.filter((c) => counts.has(c.id))
    .map((c) => {
      const n = counts.get(c.id) ?? 0;
      return `\` ${String(n).padStart(2, " ")} \`  **${c.label}**`;
    })
    .join("\n");

  // two-column-ish systems list
  const sysLeft: string[] = [];
  const sysRight: string[] = [];
  SYSTEMS.forEach((s, i) => {
    const line = `\`${s.cmd}\``;
    if (i % 2 === 0) sysLeft.push(line);
    else sysRight.push(line);
  });
  const sysBlock = SYSTEMS.map((s) => `\`${s.cmd}\` **${s.label}**`).join("\n");

  return baseEmbed(Theme.primary)
    .setAuthor({
      name: "Yuta Komutlar",
      iconURL: client.user?.displayAvatarURL({ size: 128 }) ?? undefined,
    })
    .setDescription(
      [
        "**Kategoriler**",
        catBlock,
        "",
        "**Sistemler**",
        sysBlock,
        "",
        line(),
        `**${total}** komut  ·  ${prem ? "Premium" : "Free"}`,
      ].join("\n")
    );
}

function categoryEmbed(client: YutaClient, categoryId: string): EmbedBuilder {
  const meta = CATEGORIES.find((c) => c.id === categoryId);
  const commands = publicCommands(client)
    .filter((c) => c.category === categoryId)
    .sort((a, b) => a.name.localeCompare(b.name));

  const list =
    commands.length === 0
      ? "—"
      : commands.map((c) => `\`/${c.name}\`  ${c.description}`).join("\n");

  return baseEmbed(Theme.primary)
    .setAuthor({ name: meta?.label ?? categoryId })
    .setDescription([list.slice(0, 3800)].join("\n"))
    .setFooter({ text: `${commands.length} komut` });
}

function systemEmbed(value: string): EmbedBuilder {
  const title = SYSTEMS.find((s) => s.value === value)?.label ?? "Sistem";
  return baseEmbed(Theme.primary)
    .setAuthor({ name: title })
    .setDescription(SYS_BODY[value] ?? "—");
}


function searchEmbed(client: YutaClient, query: string): EmbedBuilder {
  const q = query.trim().toLowerCase();
  const hits = publicCommands(client)
    .filter(
      (c) =>
        c.name.includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category.includes(q)
    )
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 25);

  const body =
    hits.length === 0
      ? `**\`${query}\`** için sonuç yok.`
      : hits.map((c) => `\`/${c.name}\`  ${c.description}`).join("\n");

  return baseEmbed(Theme.primary)
    .setAuthor({ name: "Arama" })
    .setDescription([line(), body, line()].join("\n"))
    .setFooter({ text: `${hits.length} sonuç · ${query.slice(0, 40)}` });
}

function buildRows(client: YutaClient): ActionRowBuilder[] {
  const counts = countMap(client);

  const catMenu = new StringSelectMenuBuilder()
    .setCustomId("help_cat")
    .setPlaceholder("Kategoriler")
    .addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel("Ana menü")
        .setDescription("Özet")
        .setValue("home"),
      ...CATEGORIES.filter((c) => counts.has(c.id)).map((c) =>
        new StringSelectMenuOptionBuilder()
          .setLabel(c.label)
          .setDescription(`${counts.get(c.id)} komut · ${c.blurb}`.slice(0, 100))
          .setValue(c.id)
      )
    );

  const sysMenu = new StringSelectMenuBuilder()
    .setCustomId("help_sys")
    .setPlaceholder("Sistemler")
    .addOptions(
      SYSTEMS.map((s) =>
        new StringSelectMenuOptionBuilder()
          .setLabel(s.label)
          .setDescription(s.cmd)
          .setValue(s.value)
      )
    );

  const nav = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("help_search")
      .setLabel("Ara")
      .setEmoji("🔍")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("help_home")
      .setLabel("Ana menü")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("help_premium")
      .setLabel("Premium")
      .setStyle(ButtonStyle.Primary)
  );

  return [
    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(catMenu),
    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(sysMenu),
    nav,
  ];
}

export default class HelpCommand extends Command {
  constructor() {
    super({
      name: "help",
      description: "Komut menüsü",
      category: "utility",
      cooldown: 5,
      data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Komut menüsü")
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const rows = buildRows(client);
    await interaction.reply({
      embeds: [homeEmbed(client, interaction.guildId)],
      components: rows,
    });
    const msg = await interaction.fetchReply();

    const collector = msg.createMessageComponentCollector({
      time: 180_000,
      filter: (i) => i.user.id === interaction.user.id,
    });

    collector.on("collect", async (i) => {
      try {
        if (i.isButton()) {
          if (i.customId === "help_search") {
            const modal = new ModalBuilder()
              .setCustomId("help_search_modal")
              .setTitle("Komut ara")
              .addComponents(
                new ActionRowBuilder<TextInputBuilder>().addComponents(
                  new TextInputBuilder()
                    .setCustomId("q")
                    .setLabel("Komut veya açıklama")
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder("ör: ban, ticket, premium")
                    .setRequired(true)
                    .setMaxLength(40)
                )
              );
            await i.showModal(modal);
            try {
              const sub = await i.awaitModalSubmit({
                time: 90_000,
                filter: (m) =>
                  m.customId === "help_search_modal" && m.user.id === interaction.user.id,
              });
              const q = sub.fields.getTextInputValue("q");
              await sub.update({
                embeds: [searchEmbed(client, q)],
                components: rows,
              });
            } catch {
              /* timeout / cancel */
            }
            return;
          }
          if (i.customId === "help_home") {
            await i.update({
              embeds: [homeEmbed(client, interaction.guildId)],
              components: rows,
            });
            return;
          }
          if (i.customId === "help_premium") {
            await i.update({
              embeds: [systemEmbed("sys:premium")],
              components: rows,
            });
            return;
          }
        }
        if (i.isStringSelectMenu()) {
          const v = i.values[0]!;
          if (i.customId === "help_cat") {
            const embed =
              v === "home"
                ? homeEmbed(client, interaction.guildId)
                : categoryEmbed(client, v);
            await i.update({ embeds: [embed], components: rows });
            return;
          }
          if (i.customId === "help_sys") {
            await i.update({ embeds: [systemEmbed(v)], components: rows });
          }
        }
      } catch (err) {
        client.logger.error(err, "help");
      }
    });

    collector.on("end", async () => {
      try {
        await msg.edit({ components: [] });
      } catch {
        /* */
      }
    });
  }
}
