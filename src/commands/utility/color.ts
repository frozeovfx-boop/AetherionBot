import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

export default class ColorCommand extends Command {
  constructor() {
    super({
      name: "color",
      description: "Renk önizleme",
      category: "utility",
      cooldown: 3,
      data: new SlashCommandBuilder()
        .setName("color")
        .setDescription("Renk önizleme")
        .addStringOption((o) => o.setName("hex").setDescription("Örnek: 5865F2").setRequired(true))
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const hex = interaction.options.getString("hex", true).replace("#", "");
    if (!/^[0-9A-Fa-f]{6}$/.test(hex)) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.warning).setDescription("Geçerli 6 haneli hex gir. Örnek: `5865F2`")],
        ephemeral: true,
      });
      return;
    }

    const color = parseInt(hex, 16);
    const r = (color >> 16) & 255;
    const g = (color >> 8) & 255;
    const b = color & 255;

    const embed = baseEmbed(color)
      .setAuthor({ name: "COLOR" })
      .setTitle(`#${hex.toUpperCase()}`)
      .setDescription(
        [
          line(),
          kv("HEX", code(`#${hex.toUpperCase()}`)),
          kv("RGB", code(`${r}, ${g}, ${b}`)),
          line(),
        ].join("\n")
      )
      .setImage(`https://singlecolorimage.com/get/${hex}/400x120`);

    await interaction.reply({ embeds: [embed] });
  }
}
