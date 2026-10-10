import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class ReloadCommand extends Command {
  constructor() {
    super({
      name: "reload",
      description: "Komut sayısını ve durumu gösterir (owner)",
      category: "admin",
      cooldown: 5,
      ownerOnly: true,
      data: new SlashCommandBuilder()
        .setName("reload")
        .setDescription("Komut sayısını ve durumu gösterir (owner)")
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const byCat = new Map<string, number>();
    for (const cmd of client.commands.values()) {
      byCat.set(cmd.category, (byCat.get(cmd.category) ?? 0) + 1);
    }

    const lines = [...byCat.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([cat, n]) => `**${cat}**: ${n}`)
      .join("\n");

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("Bot Durumu")
      .setDescription(`Toplam komut: **${client.commands.size}**\n\n${lines}`)
      .addFields(
        { name: "Sunucular", value: `${client.guilds.cache.size}`, inline: true },
        { name: "Ping", value: `${client.ws.ping}ms`, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
}
