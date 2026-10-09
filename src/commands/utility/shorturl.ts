import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class ShortUrlCommand extends Command {
  constructor() {
    super({
      name: "shorturl",
      description: "URL kısaltır",
      category: "utility",
      cooldown: 5,
      data: new SlashCommandBuilder()
        .setName("shorturl")
        .setDescription("URL kısaltır")
        .addStringOption((opt) =>
          opt.setName("url").setDescription("Uzun URL").setRequired(true)
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const url = interaction.options.getString("url", true);

    if (!/^https?:\/\//i.test(url)) {
      await interaction.reply({ content: "Geçerli bir URL gir (https://...)", ephemeral: true });
      return;
    }

    await interaction.deferReply();

    try {
      const res = await fetch(`https://is.gd/create.php?format=json&url=${encodeURIComponent(url)}`);
      const data = (await res.json()) as { shorturl?: string; errormessage?: string };

      if (!data.shorturl) {
        await interaction.editReply({ content: data.errormessage ?? "Kısaltılamadı." });
        return;
      }

      const embed = new EmbedBuilder()
        .setColor(0x57f287)
        .setTitle("URL Kısaltıldı")
        .addFields(
          { name: "Orijinal", value: url.slice(0, 200) },
          { name: "Kısa", value: data.shorturl }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch {
      await interaction.editReply({ content: "Servis hatası." });
    }
  }
}
