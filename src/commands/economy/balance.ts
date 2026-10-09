import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class BalanceCommand extends Command {
  constructor() {
    super({
      name: "balance",
      description: "Cüzdan ve banka bakiyesini gösterir",
      category: "economy",
      cooldown: 3,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("balance")
        .setDescription("Cüzdan ve banka bakiyesini gösterir")
        .addUserOption((opt) =>
          opt.setName("kullanici").setDescription("Hedef kullanıcı").setRequired(false)
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const user = interaction.options.getUser("kullanici") ?? interaction.user;
    const profile = client.economy.get(interaction.guild.id, user.id);

    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle(`💰 ${user.username} — Bakiye`)
      .addFields(
        { name: "Cüzdan", value: `**${profile.wallet.toLocaleString()}** 💵`, inline: true },
        { name: "Banka", value: `**${profile.bank.toLocaleString()}** 🏦`, inline: true },
        { name: "Toplam", value: `**${(profile.wallet + profile.bank).toLocaleString()}**`, inline: true },
        { name: "Seviye", value: `**${profile.level}** (${profile.xp} XP)`, inline: true }
      )
      .setThumbnail(user.displayAvatarURL())
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
