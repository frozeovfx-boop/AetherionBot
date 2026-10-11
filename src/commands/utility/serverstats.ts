import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ChannelType,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

export default class ServerstatsCommand extends Command {
  constructor() {
    super({
      name: "serverstats",
      description: "Sunucu + bot istatistikleri",
      category: "utility",
      cooldown: 8,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("serverstats")
        .setDescription("Sunucu + bot istatistikleri")
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const g = interaction.guild!;
    const cases = client.cases.getGuildCases(g.id, 500);
    const top = client.economy.getLeaderboard(g.id, 1);
    const prefix = client.settings.getPrefix(g.id);
    const locale = client.settings.getLocale(g.id);
    const text = g.channels.cache.filter((c) => c.type === ChannelType.GuildText).size;
    const voice = g.channels.cache.filter((c) => c.type === ChannelType.GuildVoice).size;

    const embed = baseEmbed(Theme.primary)
      .setAuthor({ name: g.name, iconURL: g.iconURL({ size: 64 }) ?? undefined })
      .setTitle("İstatistik")
      .setThumbnail(g.iconURL({ size: 256 }) ?? null)
      .setDescription(
        [
          line(),
          kv("Üyeler", code(g.memberCount.toLocaleString())),
          kv("Kanallar", code(`${text} metin · ${voice} ses`)),
          kv("Roller", code(g.roles.cache.size)),
          line(),
          kv("Prefix", code(prefix)),
          kv("Dil", code(locale)),
          kv("Cases", code(cases.length)),
          top[0]
            ? kv("En zengin", code((top[0].wallet + top[0].bank).toLocaleString()))
            : null,
          kv("Lavalink", client.music.lavalinkReady ? "Online" : "Offline"),
          line(),
        ]
          .filter(Boolean)
          .join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
}
