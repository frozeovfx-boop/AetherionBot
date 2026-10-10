import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  TextChannel,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class CloneCommand extends Command {
  constructor() {
    super({
      name: "clone",
      description: "Kanalı klonlar",
      category: "server",
      cooldown: 10,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageChannels],
      clientPermissions: [PermissionFlagsBits.ManageChannels],
      data: new SlashCommandBuilder()
        .setName("clone")
        .setDescription("Kanalı klonlar")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.channel || !("clone" in interaction.channel)) {
      await interaction.reply({ content: "Bu kanal klonlanamaz.", ephemeral: true });
      return;
    }
    const ch = interaction.channel as TextChannel;
    const cloned = await ch.clone({ reason: `clone | ${interaction.user.tag}` });
    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setDescription(`Kanal klonlandı: ${cloned}`)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
}
