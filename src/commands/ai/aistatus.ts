import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";
import { hasAnyProvider, activeProviderLabel } from "../../ai/providers.js";
import { config } from "../../config/index.js";

export default class AiStatusCommand extends Command {
  constructor() {
    super({
      name: "aistatus",
      description: "AI provider durumu",
      category: "ai",
      cooldown: 5,
      data: new SlashCommandBuilder()
        .setName("aistatus")
        .setDescription("AI provider durumu")
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const keys = [
      ["Grok", !!config.GROK_API_KEY],
      ["OpenAI", !!config.OPENAI_API_KEY],
      ["Claude", !!config.ANTHROPIC_API_KEY],
      ["Gemini", !!config.GOOGLE_API_KEY],
    ] as const;

    const rows = keys
      .map(([name, ok]) => kv(name, ok ? "● aktif" : "○ yok"))
      .join("\n");

    const embed = baseEmbed(hasAnyProvider() ? Theme.success : Theme.warning)
      .setAuthor({ name: "AI" })
      .setTitle("Provider Durumu")
      .setDescription(
        [
          line(),
          rows,
          line(),
          kv("Seçili", code(activeProviderLabel())),
        ].join("\n")
      );

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
}
