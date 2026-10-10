import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { SHOP_ITEMS } from "./shop.js";
import { inventories } from "./buy.js";

export default class InventoryCommand extends Command {
  constructor() {
    super({
      name: "inventory",
      description: "Envanterini gösterir",
      category: "economy",
      cooldown: 3,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("inventory")
        .setDescription("Envanterini gösterir")
        .addUserOption((opt) =>
          opt.setName("kullanici").setDescription("Hedef").setRequired(false)
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const user = interaction.options.getUser("kullanici") ?? interaction.user;
    const key = `${interaction.guild.id}:${user.id}`;
    const inv = inventories.get(key) ?? [];

    if (inv.length === 0) {
      await interaction.reply({ content: "Envanter boş.", ephemeral: true });
      return;
    }

    const counts = new Map<string, number>();
    for (const id of inv) counts.set(id, (counts.get(id) ?? 0) + 1);

    const lines = [...counts.entries()].map(([id, n]) => {
      const item = SHOP_ITEMS.find((i) => i.id === id);
      return `**${item?.name ?? id}** ×${n}`;
    });

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`Envanter — ${user.username}`)
      .setDescription(lines.join("\n"))
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
