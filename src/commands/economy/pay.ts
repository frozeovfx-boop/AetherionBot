import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class PayCommand extends Command {
  constructor() {
    super({
      name: "pay",
      description: "Başka bir kullanıcıya para gönder",
      category: "economy",
      cooldown: 5,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("pay")
        .setDescription("Başka bir kullanıcıya para gönder")
        .addUserOption((opt) =>
          opt.setName("kullanici").setDescription("Alıcı").setRequired(true)
        )
        .addIntegerOption((opt) =>
          opt.setName("miktar").setDescription("Miktar").setRequired(true).setMinValue(1)
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const target = interaction.options.getUser("kullanici", true);
    const amount = interaction.options.getInteger("miktar", true);

    if (target.id === interaction.user.id) {
      await interaction.reply({ content: "Kendine para gönderemezsin.", ephemeral: true });
      return;
    }

    if (target.bot) {
      await interaction.reply({ content: "Botlara para gönderemezsin.", ephemeral: true });
      return;
    }

    const ok = client.economy.removeWallet(interaction.guild.id, interaction.user.id, amount);
    if (!ok) {
      await interaction.reply({ content: "Cüzdanında yeterli para yok.", ephemeral: true });
      return;
    }

    client.economy.addWallet(interaction.guild.id, target.id, amount);

    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle("Para Gönderildi")
      .setDescription(`${target} kullanıcısına **${amount.toLocaleString()}** 💵 gönderildi.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
