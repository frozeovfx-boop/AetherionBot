import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class MembercountCommand extends Command {
  constructor() {
    super({
      name: "membercount",
      description: "Üye sayısını gösterir",
      category: "utility",
      cooldown: 3,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("membercount")
        .setDescription("Üye sayısını gösterir")
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const total = interaction.guild.memberCount;
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("Üye Sayısı")
      .setDescription(`**${total.toLocaleString()}** üye`)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
}
