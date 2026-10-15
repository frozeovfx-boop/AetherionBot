import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

const COOLDOWN = 86_400_000;
const REWARD = 500;

export default class DailyCommand extends Command {
  constructor() {
    super({
      name: "daily",
      description: "Günlük ödül",
      category: "economy",
      cooldown: 5,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("daily")
        .setDescription("Günlük ödül")
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const p = client.economy.get(interaction.guild.id, interaction.user.id);
    const now = Date.now();

    if (p.lastDaily && now - p.lastDaily < COOLDOWN) {
      const left = p.lastDaily + COOLDOWN;
      await interaction.reply({
        embeds: [
          baseEmbed(Theme.warning)
            .setAuthor({ name: "DAILY" })
            .setDescription(
              [line(), `Sonraki ödül <t:${Math.floor(left / 1000)}:R>`, line()].join("\n")
            ),
        ],
        ephemeral: true,
      });
      return;
    }

    p.lastDaily = now;
    client.economy.addWallet(interaction.guild.id, interaction.user.id, REWARD);

    await interaction.reply({
      embeds: [
        baseEmbed(Theme.economy)
          .setAuthor({ name: "DAILY" })
          .setDescription(
            [line(), kv("Ödül", code(`+${REWARD}`)), kv("Cüzdan", code(client.economy.get(interaction.guild.id, interaction.user.id).wallet)), line()].join(
              "\n"
            )
          ),
      ],
    });
  }
}
