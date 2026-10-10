import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class SetnickCommand extends Command {
  constructor() {
    super({
      name: "setnick",
      description: "Kendi takma adını değiştirir",
      category: "server",
      cooldown: 5,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("setnick")
        .setDescription("Kendi takma adını değiştirir")
        .addStringOption((opt) =>
          opt.setName("takma_ad").setDescription("Yeni takma ad").setRequired(false)
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild || !interaction.member) return;
    const nick = interaction.options.getString("takma_ad");
    const member = await interaction.guild.members.fetch(interaction.user.id);
    if (!member.manageable) {
      await interaction.reply({ content: "Takma adın değiştirilemiyor.", ephemeral: true });
      return;
    }
    await member.setNickname(nick);
    await interaction.reply({ content: nick ? `Takma adın **${nick}** oldu.` : "Takma adın sıfırlandı." });
  }
}
