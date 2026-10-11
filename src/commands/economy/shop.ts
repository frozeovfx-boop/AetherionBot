import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, code } from "../../utils/embeds.js";

export const SHOP_ITEMS = [
  { id: "coffee", name: "Kahve", price: 50, desc: "Küçük bir mola" },
  { id: "laptop", name: "Laptop", price: 5000, desc: "İş için şart" },
  { id: "car", name: "Araba", price: 25000, desc: "Hızlı git" },
  { id: "mansion", name: "Malikane", price: 100000, desc: "Zenginlik" },
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
      data: new SlashCommandBuilder().setName("shop").setDescription("Mağazayı gösterir").toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const rows = SHOP_ITEMS.map(
      (i) => `**${i.name}**  ${code(i.id)}\n　　${i.desc}  ·  **${i.price.toLocaleString()}** 💵`
    ).join("\n\n");

    const embed = baseEmbed(Theme.economy)
      .setAuthor({ name: "ECONOMY" })
      .setTitle("Mağaza")
      .setDescription(
        [
          line(),
          rows,
          line(),
          `Satın al  →  ${code("/buy urun:id")}`,
        ].join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
}
