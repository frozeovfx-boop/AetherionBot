import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

const COOLDOWN = 60 * 60 * 1000;
const JOBS = [
  { name: "yazılımcı", min: 80, max: 200 },
  { name: "kurye", min: 50, max: 120 },
  { name: "aşçı", min: 60, max: 150 },
  { name: "öğretmen", min: 70, max: 160 },
  { name: "mühendis", min: 100, max: 250 },
  { name: "tasarımcı", min: 90, max: 180 },
];

export default class WorkCommand extends Command {
  constructor() {
    super({
      name: "work",
      description: "Çalışıp para kazan",
      category: "economy",
      cooldown: 3,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("work")
        .setDescription("Çalışıp para kazan")
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const profile = client.economy.get(interaction.guild.id, interaction.user.id);
    const now = Date.now();

    if (profile.lastWork && now - profile.lastWork < COOLDOWN) {
      const remaining = COOLDOWN - (now - profile.lastWork);
      const mins = Math.ceil(remaining / 60_000);
      await interaction.reply({
        content: `Çok yorgunsun. **${mins} dakika** sonra tekrar çalışabilirsin.`,
        ephemeral: true,
      });
      return;
    }

    const job = JOBS[Math.floor(Math.random() * JOBS.length)]!;
    const amount = Math.floor(Math.random() * (job.max - job.min + 1)) + job.min;

    profile.lastWork = now;
    client.economy.addWallet(interaction.guild.id, interaction.user.id, amount);
    client.economy.addXp(interaction.guild.id, interaction.user.id, Math.floor(amount / 10));

    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle("İş Tamam")
      .setDescription(`**${job.name}** olarak çalıştın ve **${amount.toLocaleString()}** 💵 kazandın.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
