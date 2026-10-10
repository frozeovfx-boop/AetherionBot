import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export const SHOP_ITEMS = [
  { id: "coffee", name: "Kahve", price: 50, desc: "Günün yorgunluğunu at" },
  { id: "laptop", name: "Laptop", price: 5000, desc: "İş için şart" },
  { id: "car", name: "Araba", price: 25000, desc: "Hızlı git" },
  { id: "mansion", name: "Malikane", price: 100000, desc: "Zenginlik göstergesi" },
  { id: "trophy", name: "Kupa", price: 1000, desc: "Koleksiyon" },
];

export default class ShopCommand extends Command {
  constructor() {
    super({
      name: "shop",
      description: "Mağazayı gösterir",
      category: "economy",
      cooldown: 3,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("shop")
        .setDescription("Mağazayı gösterir")
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const lines = SHOP_ITEMS.map(
      (i) => `**${i.name}** (\`${i.id}\`) — ${i.price.toLocaleString()} 💵\n↳ ${i.desc}`
    ).join("\n\n");

    const embed = new EmbedBuilder()
      .setColor(0xfee75c)
      .setTitle("🛒 Mağaza")
      .setDescription(lines)
      .setFooter({ text: "Satın almak için /buy <id>" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
