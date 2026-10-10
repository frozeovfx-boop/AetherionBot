import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { SHOP_ITEMS } from "./shop.js";
import { Collection } from "discord.js";

/** guildId:userId -> item ids */
export const inventories = new Collection<string, string[]>();

export default class BuyCommand extends Command {
  constructor() {
    super({
      name: "buy",
      description: "Mağazadan ürün satın al",
      category: "economy",
      cooldown: 3,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("buy")
        .setDescription("Mağazadan ürün satın al")
        .addStringOption((opt) =>
          opt.setName("urun").setDescription("Ürün id (shop'tan)").setRequired(true)
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const itemId = interaction.options.getString("urun", true).toLowerCase();
    const item = SHOP_ITEMS.find((i) => i.id === itemId);

    if (!item) {
      await interaction.reply({ content: "Ürün bulunamadı. `/shop` ile listeye bak.", ephemeral: true });
      return;
    }

    if (!client.economy.removeWallet(interaction.guild.id, interaction.user.id, item.price)) {
      await interaction.reply({ content: "Yeterli paran yok.", ephemeral: true });
      return;
    }

    const key = `${interaction.guild.id}:${interaction.user.id}`;
    const inv = inventories.get(key) ?? [];
    inv.push(item.id);
    inventories.set(key, inv);

    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle("Satın Alındı")
      .setDescription(`**${item.name}** satın aldın (−${item.price.toLocaleString()} 💵)`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
