import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class ClearCommand extends Command {
  constructor() {
    super({
      name: "clear",
      description: "Mesaj siler (purge alias)",
      category: "moderation",
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageMessages],
      clientPermissions: [PermissionFlagsBits.ManageMessages],
      data: new SlashCommandBuilder()
        .setName("clear")
        .setDescription("Mesaj siler")
        .addIntegerOption((opt) =>
          opt.setName("miktar").setDescription("1-100").setRequired(true).setMinValue(1).setMaxValue(100)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.channel || !("bulkDelete" in interaction.channel)) return;
    const amount = interaction.options.getInteger("miktar", true);
    await interaction.deferReply({ ephemeral: true });
    const deleted = await (interaction.channel as TextChannel).bulkDelete(amount, true);
    await interaction.editReply({ content: `**${deleted.size}** mesaj silindi.` });
  }
}
