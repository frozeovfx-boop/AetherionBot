import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class ChooseCommand extends Command {
  constructor() {
    super({
      name: "choose",
      description: "Şıklardan birini seçer",
      category: "fun",
      cooldown: 3,
      data: new SlashCommandBuilder()
        .setName("choose")
        .setDescription("Şıklardan birini seçer")
        .addStringOption((opt) => opt.setName("secenekler").setDescription("Virgülle ayır").setRequired(true))
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const raw = interaction.options.getString("secenekler", true);
    const options = raw.split(",").map((s) => s.trim()).filter(Boolean);
    if (options.length < 2) {
      await interaction.reply({ content: "En az 2 seçenek gir (virgülle ayır).", ephemeral: true });
      return;
    }
    const pick = options[Math.floor(Math.random() * options.length)];
    await interaction.reply({ content: `🎯 Seçim: **${pick}**` });
  }
}
