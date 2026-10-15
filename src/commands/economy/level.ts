import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, kv, code, bar } from "../../utils/embeds.js";

export default class LevelCommand extends Command {
  constructor() {
    super({
      name: "level",
      description: "Seviye ve XP",
      category: "economy",
      cooldown: 3,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("level")
        .setDescription("Seviye ve XP")
        .addUserOption((o) => o.setName("kullanici").setDescription("Hedef").setRequired(false))
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const user = interaction.options.getUser("kullanici") ?? interaction.user;
    const p = client.economy.get(interaction.guild.id, user.id);
    const needed = p.level * 100;

    const embed = baseEmbed(Theme.economy)
      .setAuthor({ name: user.username, iconURL: user.displayAvatarURL({ size: 64 }) })
      .setTitle("Seviye")
      .setThumbnail(user.displayAvatarURL({ size: 256 }))
      .setDescription(
        [
          line(),
          kv("Seviye", `**${p.level}**`),
          kv("XP", `${code(`${p.xp}/${needed}`)}`),
          bar(p.xp / needed),
          line(),
        ].join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
}
