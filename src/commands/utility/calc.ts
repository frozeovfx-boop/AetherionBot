import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class CalcCommand extends Command {
  constructor() {
    super({
      name: "calc",
      description: "Basit matematik hesaplar",
      category: "utility",
      cooldown: 3,
      data: new SlashCommandBuilder()
        .setName("calc")
        .setDescription("Basit matematik hesaplar")
        .addStringOption((opt) =>
          opt.setName("ifade").setDescription("Örnek: 2+2*5").setRequired(true)
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const expr = interaction.options.getString("ifade", true).replace(/\s/g, "");

    if (!/^[\d+\-*/().%^]+$/.test(expr)) {
      await interaction.reply({ content: "Geçersiz ifade. Sadece sayılar ve + - * / ( ) kullan.", ephemeral: true });
      return;
    }

    try {
      // Safe-ish eval for basic math only
      const result = Function(`"use strict"; return (${expr})`)();
      if (typeof result !== "number" || !Number.isFinite(result)) {
        await interaction.reply({ content: "Hesaplanamadı.", ephemeral: true });
        return;
      }

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle("🔢 Hesap")
        .addFields(
          { name: "İfade", value: `\`${expr}\``, inline: true },
          { name: "Sonuç", value: `\`${result}\``, inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch {
      await interaction.reply({ content: "Hesap hatası.", ephemeral: true });
    }
  }
}
