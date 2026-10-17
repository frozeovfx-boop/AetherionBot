import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";
import { askAI, hasAnyProvider, activeProviderLabel } from "../../ai/providers.js";
import { assertPremiumFeature } from "../../utils/premium.js";

export default class AskCommand extends Command {
  constructor() {
    super({
      name: "ask",
      description: "AI'ya soru sor",
      category: "ai",
      cooldown: 12,
      data: new SlashCommandBuilder()
        .setName("ask")
        .setDescription("AI'ya soru sor")
        .addStringOption((o) =>
          o.setName("soru").setDescription("Soru").setRequired(true).setMaxLength(1000)
        )
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const question = interaction.options.getString("soru", true);

    const gate = assertPremiumFeature(client, interaction.guildId, "ask");
    if (!gate.ok) {
      await interaction.reply({ embeds: [gate.embed], ephemeral: true });
      return;
    }

    if (!hasAnyProvider()) {
      await interaction.reply({
        embeds: [
          baseEmbed(Theme.warning)
            .setAuthor({ name: "AI" })
            .setTitle("Provider Yok")
            .setDescription(
              [
                line(),
                "API anahtarı tanımlı değil.",
                "",
                "Hosting env'e birini ekle:",
                code("GROK_API_KEY"),
                code("OPENAI_API_KEY"),
                code("ANTHROPIC_API_KEY"),
                code("GOOGLE_API_KEY"),
                line(),
              ].join("\n")
            ),
        ],
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply();

    try {
      const result = await askAI(question);
      const answer = result.text.slice(0, 1800);

      const embed = baseEmbed(Theme.info)
        .setAuthor({ name: "AI" })
        .setTitle("Yanıt")
        .setDescription(
          [
            line(),
            `**Soru**\n${question.slice(0, 400)}`,
            "",
            `**Cevap**\n${answer}`,
            line(),
          ].join("\n")
        )
        .setFooter({ text: `${activeProviderLabel()} · Yuta` });

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      client.logger.error(err, "AI ask failed");
      const msg = err instanceof Error ? err.message : "Bilinmeyen hata";

      await interaction.editReply({
        embeds: [
          baseEmbed(Theme.danger)
            .setAuthor({ name: "AI" })
            .setTitle("Hata")
            .setDescription(
              [
                line(),
                kv("Provider", activeProviderLabel()),
                msg.slice(0, 300),
                line(),
              ].join("\n")
            ),
        ],
      });
    }
  }
}
