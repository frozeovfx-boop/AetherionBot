import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, kv } from "../../utils/embeds.js";

function parseDuration(input: string): number | null {
  const match = input.match(/^(\d+)(s|m|h|d)$/i);
  if (!match) return null;
  const value = parseInt(match[1]!, 10);
  const unit = match[2]!.toLowerCase();
  const map: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return value * (map[unit] ?? 0);
}

export default class RemindCommand extends Command {
  constructor() {
    super({
      name: "remind",
      description: "Hatırlatıcı kurar",
      category: "utility",
      cooldown: 5,
      data: new SlashCommandBuilder()
        .setName("remind")
        .setDescription("Hatırlatıcı kurar")
        .addStringOption((o) => o.setName("sure").setDescription("10m, 2h, 1d").setRequired(true))
        .addStringOption((o) => o.setName("mesaj").setDescription("Hatırlatma").setRequired(true))
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const durationStr = interaction.options.getString("sure", true);
    const message = interaction.options.getString("mesaj", true);
    const ms = parseDuration(durationStr);

    if (!ms || ms < 5_000 || ms > 30 * 86_400_000) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.warning).setDescription("Geçersiz süre. Örnek: `10m` `2h` `1d`")],
        ephemeral: true,
      });
      return;
    }

    const ends = Date.now() + ms;

    const embed = baseEmbed(Theme.info)
      .setAuthor({ name: "REMIND" })
      .setTitle("Kuruldu")
      .setDescription(
        [
          line(),
          kv("Mesaj", message.slice(0, 200)),
          kv("Zaman", `<t:${Math.floor(ends / 1000)}:R>`),
          line(),
        ].join("\n")
      );

    await interaction.reply({ embeds: [embed] });

    setTimeout(async () => {
      try {
        await interaction.user.send({
          embeds: [
            baseEmbed(Theme.info)
              .setAuthor({ name: "REMIND" })
              .setTitle("Hatırlatma")
              .setDescription(message.slice(0, 2000)),
          ],
        });
      } catch {
        /* DMs closed */
      }
    }, ms);
  }
}
