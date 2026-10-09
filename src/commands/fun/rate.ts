import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class RateCommand extends Command {
  constructor() {
    super({
      name: "rate",
      description: "Bir şeyi 0-10 arası puanlar",
      category: "fun",
      cooldown: 3,
      data: new SlashCommandBuilder()
        .setName("rate")
        .setDescription("Bir şeyi 0-10 arası puanlar")
        .addStringOption((opt) =>
          opt.setName("hedef").setDescription("Ne puanlanacak?").setRequired(true)
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getString("hedef", true);
    // Deterministic-ish from string
    let hash = 0;
    for (let i = 0; i < target.length; i++) hash = (hash + target.charCodeAt(i) * (i + 1)) % 11;
    const score = hash;

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("⭐ Rate")
      .setDescription(`**${target}** → **${score}/10**`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
