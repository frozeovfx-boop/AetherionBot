import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed } from "../../utils/embeds.js";

export default class SayCommand extends Command {
  constructor() {
    super({
      name: "say",
      description: "Bot adına mesaj yazar",
      category: "utility",
      cooldown: 3,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageMessages],
      data: new SlashCommandBuilder()
        .setName("say")
        .setDescription("Bot adına mesaj yazar")
        .addStringOption((o) => o.setName("mesaj").setDescription("Mesaj").setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const text = interaction.options.getString("mesaj", true);
    await interaction.reply({ content: "✓", ephemeral: true });
    await interaction.channel?.send({ content: text.slice(0, 2000) });
  }
}
