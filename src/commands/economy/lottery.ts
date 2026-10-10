import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

const TICKET = 100;
const pools = new Map<string, { userId: string; tickets: number }[]>();

export default class LotteryCommand extends Command {
  constructor() {
    super({
      name: "lottery",
      description: "Piyango bileti al / çekiliş durumu",
      category: "economy",
      cooldown: 5,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("lottery")
        .setDescription("Piyango bileti al")
        .addStringOption((opt) =>
          opt.setName("islem").setDescription("İşlem").setRequired(true)
            .addChoices(
              { name: "Bilet al", value: "buy" },
              { name: "Durum", value: "status" },
              { name: "Çekiliş (owner)", value: "draw" }
            )
        )
        .addIntegerOption((opt) =>
          opt.setName("adet").setDescription("Bilet adedi").setRequired(false).setMinValue(1).setMaxValue(10)
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const action = interaction.options.getString("islem", true);
    const count = interaction.options.getInteger("adet") ?? 1;
    const pool = pools.get(interaction.guild.id) ?? [];

    if (action === "buy") {
      const cost = TICKET * count;
      if (!client.economy.removeWallet(interaction.guild.id, interaction.user.id, cost)) {
        await interaction.reply({ content: `Yetersiz bakiye. Bilet: ${TICKET} 💵`, ephemeral: true });
        return;
      }
      let entry = pool.find((e) => e.userId === interaction.user.id);
      if (!entry) {
        entry = { userId: interaction.user.id, tickets: 0 };
        pool.push(entry);
      }
      entry.tickets += count;
      pools.set(interaction.guild.id, pool);
      await interaction.reply({ content: `**${count}** bilet aldın (−${cost} 💵). Toplam biletin: **${entry.tickets}**` });
      return;
    }

    if (action === "status") {
      const total = pool.reduce((a, e) => a + e.tickets, 0);
      const prize = total * TICKET;
      const embed = new EmbedBuilder()
        .setColor(0xfee75c)
        .setTitle("🎰 Piyango")
        .setDescription(`Toplam bilet: **${total}**\nHavuz: **${prize.toLocaleString()}** 💵\nKatılımcı: **${pool.length}**`)
        .setTimestamp();
      await interaction.reply({ embeds: [embed] });
      return;
    }

    if (action === "draw") {
      if (!client.config.ownerIds.includes(interaction.user.id)) {
        await interaction.reply({ content: "Sadece owner çekiliş yapabilir.", ephemeral: true });
        return;
      }
      const tickets: string[] = [];
      for (const e of pool) for (let i = 0; i < e.tickets; i++) tickets.push(e.userId);
      if (tickets.length === 0) {
        await interaction.reply({ content: "Hiç bilet yok.", ephemeral: true });
        return;
      }
      const winnerId = tickets[Math.floor(Math.random() * tickets.length)]!;
      const prize = tickets.length * TICKET;
      client.economy.addWallet(interaction.guild.id, winnerId, prize);
      pools.set(interaction.guild.id, []);
      const embed = new EmbedBuilder()
        .setColor(0x57f287)
        .setTitle("Piyango Sonucu")
        .setDescription(`Kazanan: <@${winnerId}>\nÖdül: **${prize.toLocaleString()}** 💵`)
        .setTimestamp();
      await interaction.reply({ embeds: [embed] });
    }
  }
}
