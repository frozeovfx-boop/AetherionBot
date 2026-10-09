import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class AskCommand extends Command {
  constructor() {
    super({
      name: "ask",
      description: "AI'ya soru sor (multi-provider hazır)",
      category: "ai",
      cooldown: 10,
      data: new SlashCommandBuilder()
        .setName("ask")
        .setDescription("AI'ya soru sor")
        .addStringOption((opt) =>
          opt.setName("soru").setDescription("Sorun").setRequired(true)
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const question = interaction.options.getString("soru", true);

    await interaction.deferReply();

    // Provider keys not required yet — placeholder response until API keys configured
    const hasKey =
      client.config.GROK_API_KEY ||
      client.config.OPENAI_API_KEY ||
      client.config.ANTHROPIC_API_KEY ||
      client.config.GOOGLE_API_KEY;

    if (!hasKey) {
      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle("AI")
        .setDescription(
          `Soru: **${question.slice(0, 200)}**\n\n` +
            `AI provider henüz yapılandırılmadı.\n` +
            `\`.env\` içine \`GROK_API_KEY\` / \`OPENAI_API_KEY\` ekleyince cevap üretecek.`
        )
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    // Future: route to Grok / OpenAI / Claude / Gemini
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("AI")
      .setDescription(`Soru alındı. Provider entegrasyonu bir sonraki adımda tamamlanacak.`)
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }
}
