import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class PingCommand extends Command {
  constructor() {
    super({
      name: "ping",
      description: "Bot gecikmesini gösterir",
      category: "utility",
      cooldown: 3,
      data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Bot gecikmesini gösterir")
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const sent = await interaction.reply({ content: "Pinging...", fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = Math.round(client.ws.ping);

    await interaction.editReply(
      `🏓 **Pong!**\n` +
      `• Latency: \`${latency}ms\`\n` +
      `• API Latency: \`${apiLatency}ms\``
    );
  }
}
