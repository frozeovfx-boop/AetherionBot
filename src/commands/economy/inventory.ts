import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { SHOP_ITEMS } from "./shop.js";
import { Theme, baseEmbed, line } from "../../utils/embeds.js";

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

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const user = interaction.options.getUser("kullanici") ?? interaction.user;
    const counts = client.inventory.counts(interaction.guild.id, user.id);

    if (counts.size === 0) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.mute).setDescription("Envanter boş.")],
        ephemeral: true,
      });
      return;
    }

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
