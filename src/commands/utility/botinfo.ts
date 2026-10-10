import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  version as djsVersion,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class BotinfoCommand extends Command {
  constructor() {
    super({
      name: "botinfo",
      description: "Bot bilgilerini gösterir",
      category: "utility",
      cooldown: 5,
      data: new SlashCommandBuilder()
        .setName("botinfo")
        .setDescription("Bot bilgilerini gösterir")
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("Aetherion")
      .addFields(
        { name: "Sunucular", value: `${client.guilds.cache.size}`, inline: true },
        { name: "Kullanıcılar", value: `${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)}`, inline: true },
        { name: "Komutlar", value: `${client.commands.size}`, inline: true },
        { name: "Ping", value: `${client.ws.ping}ms`, inline: true },
        { name: "Node", value: process.version, inline: true },
        { name: "discord.js", value: djsVersion, inline: true }
      )
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
}
