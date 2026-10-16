import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";
import { FILTERS, listFilterChoices, type FilterPreset } from "../../music/filters.js";

export default class FilterCommand extends Command {
  constructor() {
    super({
      name: "filter",
      description: "Müzik ses filtresi (bass, 8d, nightcore…)",
      category: "music",
      cooldown: 5,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("filter")
        .setDescription("Müzik ses filtresi")
        .addStringOption((o) =>
          o
            .setName("tip")
            .setDescription("Filtre")
            .setRequired(true)
            .addChoices(...listFilterChoices().map((c) => ({ name: c.name, value: c.value })))
        )
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const tip = interaction.options.getString("tip", true) as FilterPreset;
    const queue = client.music.getQueue(interaction.guild.id);

    if (!queue?.current) {
      await interaction.reply({
        embeds: [
          baseEmbed(Theme.warning)
            .setAuthor({ name: "MUSIC" })
            .setDescription("Önce bir parça çal / kuyruğa ekle."),
        ],
        ephemeral: true,
      });
      return;
    }

    client.music.setFilter(interaction.guild.id, tip);
    const def = FILTERS[tip];

    await interaction.reply({
      embeds: [
        baseEmbed(Theme.music)
          .setAuthor({ name: "MUSIC · FILTER" })
          .setDescription(
            [
              line(),
              kv("Filtre", `**${def.label}**`),
              kv("Etki", def.blurb),
              kv("Parça", queue.current.title),
              line(),
              client.music.lavalinkReady
                ? "Lavalink online — filtre player oturumu varken uygulanır."
                : "Lavalink offline — tercih kaydedildi; ses için node şart.",
              tip === "vaporwave" || tip === "tremolo" || tip === "8d"
                ? "_Tam reverb eklentisi değil; built-in yaklaşım (8d/tremolo/vaporwave)._"
                : null,
            ]
              .filter(Boolean)
              .join("\n")
          ),
      ],
    });
  }
}
