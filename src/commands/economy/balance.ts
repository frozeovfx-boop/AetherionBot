import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, code, divider } from "../../utils/embeds.js";

export default class BalanceCommand extends Command {
  constructor() {
    super({
      name: "balance",
      description: "Cüzdan ve banka bakiyesi",
      category: "economy",
      cooldown: 3,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("balance")
        .setDescription("Cüzdan ve banka bakiyesi")
        .addUserOption((opt) =>
          opt.setName("kullanici").setDescription("Hedef").setRequired(false)
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const user = interaction.options.getUser("kullanici") ?? interaction.user;
    const p = client.economy.get(interaction.guild.id, user.id);
    const total = p.wallet + p.bank;
    const needed = p.level * 100;
    const xpBar = progressBar(p.xp, needed, 10);

    const embed = baseEmbed(Theme.economy)
      .setAuthor({
        name: user.username,
        iconURL: user.displayAvatarURL({ size: 128 }),
      })
      .setTitle("⬡ Bakiye")
      .setDescription(
        [
          divider(),
          `Cüzdan     ${code(`${p.wallet.toLocaleString()} 💵`)}`,
          `Banka      ${code(`${p.bank.toLocaleString()} 🏦`)}`,
          `Toplam     **${total.toLocaleString()}**`,
          divider(),
          `Seviye **${p.level}**  ${xpBar}  ${code(`${p.xp}/${needed} XP`)}`,
        ].join("\n")
      )
      .setThumbnail(user.displayAvatarURL({ size: 256 }));

    await interaction.reply({ embeds: [embed] });
  }
}

function progressBar(current: number, max: number, size: number): string {
  const filled = Math.min(size, Math.round((current / Math.max(max, 1)) * size));
  return `\`${"█".repeat(filled)}${"░".repeat(size - filled)}\``;
}
