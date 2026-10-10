import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class LevelCommand extends Command {
  constructor() {
    super({
      name: "level",
      description: "Seviye ve XP gösterir",
      category: "economy",
      cooldown: 3,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("level")
        .setDescription("Seviye ve XP gösterir")
        .addUserOption((opt) =>
          opt.setName("kullanici").setDescription("Hedef").setRequired(false)
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const user = interaction.options.getUser("kullanici") ?? interaction.user;
    const p = client.economy.get(interaction.guild.id, user.id);
    const needed = p.level * 100;
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`Seviye — ${user.username}`)
      .addFields(
        { name: "Seviye", value: `**${p.level}**`, inline: true },
        { name: "XP", value: `**${p.xp}/${needed}**`, inline: true }
      )
      .setThumbnail(user.displayAvatarURL())
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
}
