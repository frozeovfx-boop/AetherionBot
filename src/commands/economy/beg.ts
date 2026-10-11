import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

const CD = 5 * 60 * 1000;
const map = new Map<string, number>();

export default class BegCommand extends Command {
  constructor() {
    super({
      name: "beg",
      description: "Dilencilik yap",
      category: "economy",
      cooldown: 3,
      guildOnly: true,
      data: new SlashCommandBuilder().setName("beg").setDescription("Dilencilik yap").toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const key = `${interaction.guild.id}:${interaction.user.id}`;
    const now = Date.now();
    if (map.get(key) && now - map.get(key)! < CD) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.warning).setDescription("Biraz bekle.")],
        ephemeral: true,
      });
      return;
    }
    map.set(key, now);

    const amount = Math.floor(Math.random() * 50) + 5;
    client.economy.addWallet(interaction.guild.id, interaction.user.id, amount);
    const p = client.economy.get(interaction.guild.id, interaction.user.id);

    const embed = baseEmbed(Theme.economy)
      .setAuthor({ name: "ECONOMY" })
      .setTitle("Dilencilik")
      .setDescription(
        [
          line(),
          kv("Alınan", `**+${amount}** 💵`),
          kv("Cüzdan", code(p.wallet.toLocaleString())),
          line(),
        ].join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
}
