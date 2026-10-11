import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, kv } from "../../utils/embeds.js";

const COOLDOWN = 3 * 60 * 60 * 1000;
const crimeCd = new Map<string, number>();

const CRIMES = [
  { name: "Market soygunu", min: 100, max: 400 },
  { name: "Araba hırsızlığı", min: 150, max: 500 },
  { name: "Banka soygunu", min: 200, max: 800 },
  { name: "Dolandırıcılık", min: 80, max: 350 },
];

export default class CrimeCommand extends Command {
  constructor() {
    super({
      name: "crime",
      description: "Suç işle, risk al",
      category: "economy",
      cooldown: 5,
      guildOnly: true,
      data: new SlashCommandBuilder().setName("crime").setDescription("Suç işle, risk al").toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const key = `${interaction.guild.id}:${interaction.user.id}`;
    const now = Date.now();
    const last = crimeCd.get(key);
    if (last && now - last < COOLDOWN) {
      const mins = Math.ceil((COOLDOWN - (now - last)) / 60_000);
      await interaction.reply({
        embeds: [baseEmbed(Theme.warning).setDescription(`Polis peşinde. **${mins} dk** bekle.`)],
        ephemeral: true,
      });
      return;
    }
    crimeCd.set(key, now);

    const crime = CRIMES[Math.floor(Math.random() * CRIMES.length)]!;
    const success = Math.random() < 0.55;

    if (success) {
      const amount = Math.floor(Math.random() * (crime.max - crime.min + 1)) + crime.min;
      client.economy.addWallet(interaction.guild.id, interaction.user.id, amount);
      const embed = baseEmbed(Theme.success)
        .setAuthor({ name: "ECONOMY" })
        .setTitle("Suç Başarılı")
        .setDescription(
          [
            line(),
            kv("İş", crime.name),
            kv("Kazanç", `**+${amount.toLocaleString()}** 💵`),
            line(),
          ].join("\n")
        );
      await interaction.reply({ embeds: [embed] });
    } else {
      const fine = Math.floor(50 + Math.random() * 200);
      client.economy.removeWallet(interaction.guild.id, interaction.user.id, fine);
      const embed = baseEmbed(Theme.danger)
        .setAuthor({ name: "ECONOMY" })
        .setTitle("Yakalandın")
        .setDescription(
          [
            line(),
            kv("İş", crime.name),
            kv("Ceza", `**−${fine.toLocaleString()}** 💵`),
            line(),
          ].join("\n")
        );
      await interaction.reply({ embeds: [embed] });
    }
  }
}
