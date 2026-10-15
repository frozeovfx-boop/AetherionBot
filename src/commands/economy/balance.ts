import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, code, divider } from "../../utils/embeds.js";
import { tg } from "../../i18n/index.js";

export default class BalanceCommand extends Command {
  constructor() {
    super({
      name: "balance",
      description: "Cüzdan ve banka / Wallet and bank",
      category: "economy",
      cooldown: 3,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("balance")
        .setDescription("Wallet & bank balance")
        .addUserOption((opt) =>
          opt.setName("kullanici").setDescription("User").setRequired(false)
        )
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const user = interaction.options.getUser("kullanici") ?? interaction.user;
    const p = client.economy.get(interaction.guild.id, user.id);
    const total = p.wallet + p.bank;
    const needed = p.level * 100;
    const filled = Math.min(10, Math.round((p.xp / Math.max(needed, 1)) * 10));
    const xpBar = `\`${"█".repeat(filled)}${"░".repeat(10 - filled)}\``;
    const gid = interaction.guild.id;

    const embed = baseEmbed(Theme.economy)
      .setAuthor({
        name: user.username,
        iconURL: user.displayAvatarURL({ size: 128 }),
      })
      .setTitle(tg(gid, "eco.balance_title"))
      .setDescription(
        [
          divider(),
          `${tg(gid, "eco.wallet")}     ${code(`${p.wallet.toLocaleString()} 💵`)}`,
          `${tg(gid, "eco.bank")}      ${code(`${p.bank.toLocaleString()} 🏦`)}`,
          `${tg(gid, "eco.total")}     **${total.toLocaleString()}**`,
          divider(),
          `${tg(gid, "eco.level")} **${p.level}**  ${xpBar}  ${code(`${p.xp}/${needed} XP`)}`,
        ].join("\n")
      )
      .setThumbnail(user.displayAvatarURL({ size: 256 }));

    await interaction.reply({ embeds: [embed] });
  }
}
