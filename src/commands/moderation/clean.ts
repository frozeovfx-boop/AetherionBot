import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  TextChannel,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class CleanCommand extends Command {
  constructor() {
    super({
      name: "clean",
      description: "Bot mesajlarını temizler",
      category: "moderation",
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageMessages],
      clientPermissions: [PermissionFlagsBits.ManageMessages],
      data: new SlashCommandBuilder()
        .setName("clean")
        .setDescription("Bot mesajlarını temizler")
        .addIntegerOption((opt) =>
          opt.setName("miktar").setDescription("1-100").setRequired(false).setMinValue(1).setMaxValue(100)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.channel || !("bulkDelete" in interaction.channel)) return;
    const amount = interaction.options.getInteger("miktar") ?? 50;
    await interaction.deferReply({ ephemeral: true });
    const channel = interaction.channel as TextChannel;
    const messages = await channel.messages.fetch({ limit: 100 });
    const botMsgs = messages.filter((m) => m.author.bot).first(amount);
    if (botMsgs.length === 0) {
      await interaction.editReply({ content: "Bot mesajı yok." });
      return;
    }
    const deleted = await channel.bulkDelete(botMsgs, true);
    await interaction.editReply({ content: `**${deleted.size}** bot mesajı silindi.` });
  }
}
