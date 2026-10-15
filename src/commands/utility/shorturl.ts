import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

export default class ShorturlCommand extends Command {
  constructor() {
    super({
      name: "shorturl",
      description: "URL kısaltır",
      category: "utility",
      cooldown: 8,
      data: new SlashCommandBuilder()
        .setName("shorturl")
        .setDescription("URL kısaltır")
        .addStringOption((o) => o.setName("url").setDescription("Uzun URL").setRequired(true))
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const long = interaction.options.getString("url", true);
    if (!/^https?:\/\//i.test(long)) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.warning).setDescription("http:// veya https:// ile başlamalı.")],
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply();
    try {
      const res = await fetch(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(long)}`);
      const short = await res.text();
      if (!short.startsWith("http")) throw new Error("fail");

      const embed = baseEmbed(Theme.primary)
        .setAuthor({ name: "SHORTURL" })
        .setTitle("Kısaltıldı")
        .setDescription(
          [
            line(),
            kv("Kısa", short),
            kv("Orijinal", code(long.slice(0, 80))),
            line(),
          ].join("\n")
        );
      await interaction.editReply({ embeds: [embed] });
    } catch {
      await interaction.editReply({
        embeds: [baseEmbed(Theme.danger).setDescription("Kısaltılamadı.")],
      });
    }
  }
}
