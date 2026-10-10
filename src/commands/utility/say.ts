import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class SayCommand extends Command {
  constructor() {
    super({
      name: "say",
      description: "Botun ağzından mesaj yazar",
      category: "utility",
      cooldown: 3,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageMessages],
      data: new SlashCommandBuilder()
        .setName("say")
        .setDescription("Botun ağzından mesaj yazar")
        .addStringOption((opt) =>
          opt.setName("mesaj").setDescription("Mesaj").setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const msg = interaction.options.getString("mesaj", true);
    await interaction.reply({ content: "Gönderildi.", ephemeral: true });
    if (interaction.channel && "send" in interaction.channel) {
      await interaction.channel.send(msg);
    }
  }
}
