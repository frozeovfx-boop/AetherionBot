import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class ColorCommand extends Command {
  constructor() {
    super({
      name: "color",
      description: "Hex renk önizlemesi",
      category: "utility",
      cooldown: 3,
      data: new SlashCommandBuilder()
        .setName("color")
        .setDescription("Hex renk önizlemesi")
        .addStringOption((opt) =>
          opt.setName("hex").setDescription("Örnek: #5865F2 veya 5865F2").setRequired(true)
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    let hex = interaction.options.getString("hex", true).replace("#", "");
    if (!/^[0-9A-Fa-f]{6}$/.test(hex)) {
      await interaction.reply({ content: "Geçerli 6 haneli hex gir.", ephemeral: true });
      return;
    }
    const color = parseInt(hex, 16);
    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(`#${hex.toUpperCase()}`)
      .setDescription(`RGB: ${(color >> 16) & 255}, ${(color >> 8) & 255}, ${color & 255}`)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
}
