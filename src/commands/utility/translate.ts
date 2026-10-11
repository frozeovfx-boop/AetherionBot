import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, kv } from "../../utils/embeds.js";

export default class TranslateCommand extends Command {
  constructor() {
    super({
      name: "translate",
      description: "Metin çevirir",
      category: "utility",
      cooldown: 5,
      data: new SlashCommandBuilder()
        .setName("translate")
        .setDescription("Metin çevirir")
        .addStringOption((o) => o.setName("metin").setDescription("Çevrilecek metin").setRequired(true))
        .addStringOption((o) =>
          o
            .setName("dil")
            .setDescription("Hedef dil")
            .setRequired(false)
            .addChoices(
              { name: "English", value: "en" },
              { name: "Türkçe", value: "tr" },
              { name: "Deutsch", value: "de" },
              { name: "Français", value: "fr" },
              { name: "Español", value: "es" },
              { name: "Русский", value: "ru" },
              { name: "日本語", value: "ja" },
              { name: "العربية", value: "ar" }
            )
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const text = interaction.options.getString("metin", true);
    const to = interaction.options.getString("dil") ?? "en";
    await interaction.deferReply();

    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 500))}&langpair=aut|${to}`;
      const res = await fetch(url);
      const data = (await res.json()) as { responseData?: { translatedText?: string } };
      const out = data.responseData?.translatedText;
      if (!out) throw new Error("empty");

      const embed = baseEmbed(Theme.info)
        .setAuthor({ name: "TRANSLATE" })
        .setDescription(
          [
            line(),
            kv("Orijinal", text.slice(0, 300)),
            "",
            kv("Çeviri", out.slice(0, 1000)),
            line(),
          ].join("\n")
        );

      await interaction.editReply({ embeds: [embed] });
    } catch {
      await interaction.editReply({
        embeds: [baseEmbed(Theme.danger).setDescription("Çeviri başarısız.")],
      });
    }
  }
}
