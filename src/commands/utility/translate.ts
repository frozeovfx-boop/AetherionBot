import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class TranslateCommand extends Command {
  constructor() {
    super({
      name: "translate",
      description: "Metni çevirir",
      category: "utility",
      cooldown: 5,
      data: new SlashCommandBuilder()
        .setName("translate")
        .setDescription("Metni çevirir")
        .addStringOption((opt) =>
          opt.setName("metin").setDescription("Çevrilecek metin").setRequired(true)
        )
        .addStringOption((opt) =>
          opt
            .setName("dil")
            .setDescription("Hedef dil kodu (en, tr, de, fr...)")
            .setRequired(false)
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const text = interaction.options.getString("metin", true);
    const lang = interaction.options.getString("dil") ?? "en";

    await interaction.deferReply();

    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 500))}&langpair=autodetect|${encodeURIComponent(lang)}`;
      const res = await fetch(url);
      const data = (await res.json()) as {
        responseData?: { translatedText?: string };
        responseStatus?: number;
      };

      const translated = data.responseData?.translatedText;
      if (!translated) {
        await interaction.editReply({ content: "Çeviri alınamadı." });
        return;
      }

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle("🌐 Çeviri")
        .addFields(
          { name: "Orijinal", value: text.slice(0, 1000) },
          { name: `Çeviri (${lang})`, value: translated.slice(0, 1000) }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch {
      await interaction.editReply({ content: "Çeviri servisi hatası." });
    }
  }
}
