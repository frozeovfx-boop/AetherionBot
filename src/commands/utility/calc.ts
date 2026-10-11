import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

export default class CalcCommand extends Command {
  constructor() {
    super({
      name: "calc",
      description: "Basit matematik",
      category: "utility",
      cooldown: 3,
      data: new SlashCommandBuilder()
        .setName("calc")
        .setDescription("Basit matematik")
        .addStringOption((o) => o.setName("ifade").setDescription("Örnek: 2+2*5").setRequired(true))
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const expr = interaction.options.getString("ifade", true).replace(/\s/g, "");
    if (!/^[\d+\-*/().^%]+$/.test(expr)) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.warning).setDescription("Sadece sayılar ve + - * / ( ) kullan.")],
        ephemeral: true,
      });
      return;
    }

    try {
      const safe = expr.replace(/\^/g, "**");
      // eslint-disable-next-line no-new-func
      const result = Function(`"use strict"; return (${safe})`)();
      if (typeof result !== "number" || !Number.isFinite(result)) throw new Error("bad");

      const embed = baseEmbed(Theme.primary)
        .setAuthor({ name: "CALC" })
        .setTitle("Sonuç")
        .setDescription(
          [
            line(),
            kv("İfade", code(expr)),
            kv("Sonuç", `**${result}**`),
            line(),
          ].join("\n")
        );

      await interaction.reply({ embeds: [embed] });
    } catch {
      await interaction.reply({
        embeds: [baseEmbed(Theme.danger).setDescription("Hesaplanamadı.")],
        ephemeral: true,
      });
    }
  }
}
