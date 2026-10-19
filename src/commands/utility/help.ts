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
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, code } from "../../utils/embeds.js";
import { FREE_LIMITS, isGuildPremium } from "../../utils/premium.js";

const CATEGORIES: { id: string; label: string; blurb: string }[] = [
  { id: "moderation", label: "Moderasyon", blurb: "Ban · warn · case" },
  { id: "server", label: "Sunucu", blurb: "Ticket · log · welcome" },
  { id: "utility", label: "Araçlar", blurb: "Info · premium" },
  { id: "economy", label: "Ekonomi", blurb: "Para · level" },
  { id: "music", label: "Müzik", blurb: "Play · queue" },
  { id: "ai", label: "AI", blurb: "Ask · conseil" },
  { id: "admin", label: "Admin", blurb: "Owner" },
];

const SYSTEMS: { label: string; value: string }[] = [
  { label: "Ticket", value: "sys:ticket" },
  { label: "Automod", value: "sys:automod" },
  { label: "Log", value: "sys:log" },
  { label: "Self-role", value: "sys:selfrole" },
  { label: "Çekiliş", value: "sys:giveaway" },
  { label: "Özel oda", value: "sys:tempvoice" },
  { label: "Premium", value: "sys:premium" },
  { label: "Conseil", value: "sys:conseil" },
];

const SYS_HELP: Record<string, string> = {
  "sys:ticket": "`/ticket-setup panel` · buton · destek rolü",
  "sys:automod": "`/automod` davet · link · spam · küfür",
  "sys:log": "`/logset` mesaj · üye · ses · davet",
  "sys:selfrole": "`/selfrole panel` buton veya menü",
  "sys:giveaway": "`/giveaway baslat` · şanslı rol",
  "sys:tempvoice": "`/ozeloda` hub kanalı",
  "sys:premium": `\`/premium durum\` · ask ${FREE_LIMITS.ask}/gün · debate ${FREE_LIMITS.conseil_debate}/gün`,
  "sys:conseil": "`/conseil` debate · consult · ozet",
};

function countMap(client: YutaClient): Map<string, number> {
  const m = new Map<string, number>();
  for (const c of client.commands.values()) {
    m.set(c.category, (m.get(c.category) ?? 0) + 1);
  }
  return m;
}

function homeEmbed(client: YutaClient, guildId: string | null): EmbedBuilder {
  const counts = countMap(client);
  const prem = guildId ? isGuildPremium(client, guildId) : false;

  const cats = CATEGORIES.filter((c) => counts.has(c.id))
    .map((c) => `**${c.label}** \`${counts.get(c.id)}\``)
    .join("\n");

  return baseEmbed(Theme.primary)
    .setAuthor({
      name: "Yuta",
      iconURL: client.user?.displayAvatarURL({ size: 64 }) ?? undefined,
    })
    .setDescription(
      [
        line(),
        cats,
        line(),
        `**${client.commands.size}** komut  ·  ${prem ? "**Premium**" : "Free"}`,
        line(),
      ].join("\n")
    );
}

function categoryEmbed(client: YutaClient, categoryId: string): EmbedBuilder {
  const meta = CATEGORIES.find((c) => c.id === categoryId);
  const commands = [...client.commands.values()]
    .filter((c) => c.category === categoryId)
    .sort((a, b) => a.name.localeCompare(b.name));

  let list = commands.map((c) => `\`${c.name}\``).join("  ");
  if (list.length > 3500) list = list.slice(0, 3490) + " …";

  return baseEmbed(Theme.primary)
    .setAuthor({ name: meta?.label ?? categoryId })
    .setDescription([line(), list || "Boş", line()].join("\n"))
    .setFooter({ text: `${commands.length} · Yuta` });
}

function systemEmbed(value: string): EmbedBuilder {
  return baseEmbed(Theme.primary)
    .setAuthor({ name: SYSTEMS.find((s) => s.value === value)?.label ?? "Sistem" })
    .setDescription([line(), SYS_HELP[value] ?? "—", line()].join("\n"));
}

function buildRows(client: YutaClient): ActionRowBuilder[] {
  const counts = countMap(client);

  const catMenu = new StringSelectMenuBuilder()
    .setCustomId("help_cat")
    .setPlaceholder("Kategori")
    .addOptions(
      new StringSelectMenuOptionBuilder().setLabel("Ana menü").setValue("home"),
      ...CATEGORIES.filter((c) => counts.has(c.id)).map((c) =>
        new StringSelectMenuOptionBuilder()
          .setLabel(c.label)
          .setDescription(c.blurb)
          .setValue(c.id)
      )
    );

  const sysMenu = new StringSelectMenuBuilder()
    .setCustomId("help_sys")
    .setPlaceholder("Sistem")
    .addOptions(
      SYSTEMS.map((s) =>
        new StringSelectMenuOptionBuilder().setLabel(s.label).setValue(s.value)
      )
    );

  const btns = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId("help_home").setLabel("Ana").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("help_premium").setLabel("Premium").setStyle(ButtonStyle.Primary)
  );

  return [
    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(catMenu),
    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(sysMenu),
    btns,
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
          if (i.customId === "help_home") {
            await i.update({ embeds: [homeEmbed(client, interaction.guildId)], components: rows });
            return;
          }
          if (i.customId === "help_premium") {
            await i.update({ embeds: [systemEmbed("sys:premium")], components: rows });
            return;
          }
        }
        if (i.isStringSelectMenu()) {
          const v = i.values[0]!;
          if (i.customId === "help_cat") {
            const embed =
              v === "home" ? homeEmbed(client, interaction.guildId) : categoryEmbed(client, v);
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
