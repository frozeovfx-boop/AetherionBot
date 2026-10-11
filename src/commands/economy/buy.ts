import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Collection,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { SHOP_ITEMS } from "./shop.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

export const inventories = new Collection<string, string[]>();

export default class BuyCommand extends Command {
  constructor() {
    super({
      name: "buy",
      description: "Mağazadan ürün al",
      category: "economy",
      cooldown: 3,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("buy")
        .setDescription("Mağazadan ürün al")
        .addStringOption((o) => o.setName("urun").setDescription("Ürün id").setRequired(true))
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const itemId = interaction.options.getString("urun", true).toLowerCase();
    const item = SHOP_ITEMS.find((i) => i.id === itemId);

    if (!item) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.warning).setDescription(`Ürün yok. ${code("/shop")} ile bak.`)],
        ephemeral: true,
      });
      return;
    }

    if (!client.economy.removeWallet(interaction.guild.id, interaction.user.id, item.price)) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.danger).setDescription("Yeterli paran yok.")],
        ephemeral: true,
      });
      return;
    }

    const key = `${interaction.guild.id}:${interaction.user.id}`;
    const inv = inventories.get(key) ?? [];
    inv.push(item.id);
    inventories.set(key, inv);

    const embed = baseEmbed(Theme.success)
      .setAuthor({ name: "ECONOMY" })
      .setTitle("Satın Alındı")
      .setDescription(
        [
          line(),
          kv("Ürün", item.name),
          kv("Fiyat", `−${item.price.toLocaleString()} 💵`),
          line(),
        ].join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
}
