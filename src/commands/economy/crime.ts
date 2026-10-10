import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

const COOLDOWN = 3 * 60 * 60 * 1000;
const crimeCd = new Map<string, number>();

const CRIMES = [
  { name: "market soymaya", min: 100, max: 400 },
  { name: "araba çalmaya", min: 150, max: 500 },
  { name: "banka soymaya", min: 200, max: 800 },
  { name: "kumarhaneyi dolandırmaya", min: 80, max: 350 },
];

export default class CrimeCommand extends Command {
  constructor() {
    super({
      name: "crime",
      description: "Suç işle, risk al, para kazan",
      category: "economy",
      cooldown: 5,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("crime")
        .setDescription("Suç işle, risk al, para kazan")
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const key = `${interaction.guild.id}:${interaction.user.id}`;
    const now = Date.now();
    const last = crimeCd.get(key);
    if (last && now - last < COOLDOWN) {
      const mins = Math.ceil((COOLDOWN - (now - last)) / 60_000);
      await interaction.reply({ content: `Polis peşinde. **${mins} dk** bekle.`, ephemeral: true });
      return;
    }
    crimeCd.set(key, now);

    const crime = CRIMES[Math.floor(Math.random() * CRIMES.length)]!;
    const success = Math.random() < 0.55;

    if (success) {
      const amount = Math.floor(Math.random() * (crime.max - crime.min + 1)) + crime.min;
      client.economy.addWallet(interaction.guild.id, interaction.user.id, amount);
      const embed = new EmbedBuilder()
        .setColor(0x57f287)
        .setTitle("Suç Başarılı")
        .setDescription(`${crime.name} çalıştın ve **${amount.toLocaleString()}** 💵 kazandın.`)
        .setTimestamp();
      await interaction.reply({ embeds: [embed] });
    } else {
      const fine = Math.floor(50 + Math.random() * 200);
      client.economy.removeWallet(interaction.guild.id, interaction.user.id, fine);
      const embed = new EmbedBuilder()
        .setColor(0xed4245)
        .setTitle("Yakalandın")
        .setDescription(`${crime.name} çalışırken yakalandın. **${fine.toLocaleString()}** 💵 ceza.`)
        .setTimestamp();
      await interaction.reply({ embeds: [embed] });
    }
  }
}
