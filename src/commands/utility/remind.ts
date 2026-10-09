import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

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
      description: "Belirli süre sonra hatırlatma gönderir",
      category: "utility",
      cooldown: 5,
      data: new SlashCommandBuilder()
        .setName("remind")
        .setDescription("Belirli süre sonra hatırlatma gönderir")
        .addStringOption((opt) =>
          opt.setName("sure").setDescription("Süre (örnek: 10m, 2h, 1d)").setRequired(true)
        )
        .addStringOption((opt) =>
          opt.setName("mesaj").setDescription("Hatırlatma mesajı").setRequired(true)
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const durationStr = interaction.options.getString("sure", true);
    const message = interaction.options.getString("mesaj", true);
    const ms = parseDuration(durationStr);

    if (!ms || ms < 10_000 || ms > 7 * 86_400_000) {
      await interaction.reply({
        content: "Geçersiz süre. Örnek: `30s`, `10m`, `2h`, `1d` (min 10s, max 7 gün)",
        ephemeral: true,
      });
      return;
    }

    await interaction.reply({
      content: `Tamam. **${durationStr}** sonra hatırlatacağım: ${message}`,
      ephemeral: true,
    });

    setTimeout(async () => {
      try {
        await interaction.user.send({
          embeds: [
            new EmbedBuilder()
              .setColor(0x5865f2)
              .setTitle("⏰ Hatırlatma")
              .setDescription(message)
              .setTimestamp(),
          ],
        });
      } catch {
        // DMs closed — try channel
        try {
          if (interaction.channel && "send" in interaction.channel) {
            await interaction.channel.send({
              content: `${interaction.user}`,
              embeds: [
                new EmbedBuilder()
                  .setColor(0x5865f2)
                  .setTitle("⏰ Hatırlatma")
                  .setDescription(message)
                  .setTimestamp(),
              ],
            });
          }
        } catch {
          // ignore
        }
      }
    }, ms);
  }
}
