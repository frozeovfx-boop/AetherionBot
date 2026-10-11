import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { SHOP_ITEMS } from "./shop.js";
import { inventories } from "./buy.js";
import { Theme, baseEmbed, line, code } from "../../utils/embeds.js";

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
        .addUserOption((o) => o.setName("kullanici").setDescription("Hedef").setRequired(false))
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const user = interaction.options.getUser("kullanici") ?? interaction.user;
    const key = `${interaction.guild.id}:${user.id}`;
    const inv = inventories.get(key) ?? [];

    if (inv.length === 0) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.mute).setDescription("Envanter boş.")],
        ephemeral: true,
      });
      return;
    }

    const counts = new Map<string, number>();
    for (const id of inv) counts.set(id, (counts.get(id) ?? 0) + 1);

    const rows = [...counts.entries()].map(([id, n]) => {
      const item = SHOP_ITEMS.find((i) => i.id === id);
      return `**${item?.name ?? id}**  ×${n}`;
    });

    const embed = baseEmbed(Theme.economy)
      .setAuthor({ name: user.username, iconURL: user.displayAvatarURL({ size: 64 }) })
      .setTitle("Envanter")
      .setDescription([line(), rows.join("\n"), line()].join("\n"))
      .setThumbnail(user.displayAvatarURL({ size: 256 }));

    await interaction.reply({ embeds: [embed] });
  }
}
