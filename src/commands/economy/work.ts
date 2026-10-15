import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, code, kv } from "../../utils/embeds.js";

const COOLDOWN = 60 * 60 * 1000;
const JOBS = [
  { name: "Yazılımcı", min: 80, max: 220 },
  { name: "Kurye", min: 40, max: 120 },
  { name: "Barista", min: 50, max: 140 },
  { name: "Tasarımcı", min: 90, max: 250 },
  { name: "Şoför", min: 60, max: 160 },
];

export default class WorkCommand extends Command {
  constructor() {
    super({
      name: "work",
      description: "Çalışıp para kazan",
      category: "economy",
      cooldown: 3,
      guildOnly: true,
      data: new SlashCommandBuilder().setName("work").setDescription("Çalışıp para kazan").toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const p = client.economy.get(interaction.guild.id, interaction.user.id);
    const now = Date.now();

    if (p.lastWork && now - p.lastWork < COOLDOWN) {
      const left = Math.ceil((COOLDOWN - (now - p.lastWork)) / 60_000);
      await interaction.reply({
        embeds: [baseEmbed(Theme.warning).setDescription(`Dinlen. **${left} dk** sonra tekrar.`)],
        ephemeral: true,
      });
      return;
    }

    const job = JOBS[Math.floor(Math.random() * JOBS.length)]!;
    const amount = Math.floor(Math.random() * (job.max - job.min + 1)) + job.min;
    p.lastWork = now;
    client.economy.addWallet(interaction.guild.id, interaction.user.id, amount);
    const { leveledUp, profile } = client.economy.addXp(interaction.guild.id, interaction.user.id, 15);

    const embed = baseEmbed(Theme.economy)
      .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ size: 64 }) })
      .setTitle("Vardiya")
      .setDescription(
        [
          line(),
          kv("İş", job.name),
          kv("Kazanç", `**+${amount.toLocaleString()}** 💵`),
          kv("Cüzdan", code(profile.wallet.toLocaleString())),
          leveledUp ? kv("Seviye", `↑ **${profile.level}**`) : null,
          line(),
        ]
          .filter(Boolean)
          .join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
}
