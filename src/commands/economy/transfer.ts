import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class TransferCommand extends Command {
  constructor() {
    super({
      name: "transfer",
      description: "Bankadan bankaya transfer (alias pay)",
      category: "economy",
      cooldown: 5,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("transfer")
        .setDescription("Başka kullanıcıya para gönder")
        .addUserOption((opt) => opt.setName("kullanici").setDescription("Alıcı").setRequired(true))
        .addIntegerOption((opt) => opt.setName("miktar").setDescription("Miktar").setRequired(true).setMinValue(1))
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const target = interaction.options.getUser("kullanici", true);
    const amount = interaction.options.getInteger("miktar", true);
    if (target.bot || target.id === interaction.user.id) {
      await interaction.reply({ content: "Geçersiz hedef.", ephemeral: true });
      return;
    }
    if (!client.economy.removeWallet(interaction.guild.id, interaction.user.id, amount)) {
      await interaction.reply({ content: "Yetersiz bakiye.", ephemeral: true });
      return;
    }
    client.economy.addWallet(interaction.guild.id, target.id, amount);
    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setDescription(`${target} kullanıcısına **${amount.toLocaleString()}** 💵 gönderildi.`)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
}
