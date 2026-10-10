import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class IqCommand extends Command {
  constructor() {
    super({
      name: "iq",
      description: "IQ ölçer (eğlence)",
      category: "fun",
      cooldown: 3,
      data: new SlashCommandBuilder()
        .setName("iq")
        .setDescription("IQ ölçer (eğlence)")
        .addUserOption((opt) => opt.setName("kullanici").setDescription("Hedef").setRequired(false))
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser("kullanici") ?? interaction.user;
    const iq = Number(BigInt(user.id) % 161n) + 40;
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setDescription(`🧠 **${user.username}** IQ: **${iq}**`)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
}
