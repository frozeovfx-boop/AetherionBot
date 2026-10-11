import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, code } from "../../utils/embeds.js";

export default class RichCommand extends Command {
  constructor() {
    super({
      name: "rich",
      description: "En zenginler (leaderboard alias)",
      category: "economy",
      cooldown: 5,
      guildOnly: true,
      data: new SlashCommandBuilder().setName("rich").setDescription("En zenginler").toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const top = client.economy.getLeaderboard(interaction.guild.id, 10);

    if (top.length === 0) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.mute).setDescription("Veri yok.")],
        ephemeral: true,
      });
      return;
    }

    const lines = await Promise.all(
      top.map(async (p, i) => {
        const user = await client.users.fetch(p.userId).catch(() => null);
        return `**${i + 1}.** ${user?.username ?? p.userId} — ${code((p.wallet + p.bank).toLocaleString())}`;
      })
    );

    const embed = baseEmbed(Theme.economy)
      .setAuthor({ name: "ECONOMY" })
      .setTitle("En Zenginler")
      .setDescription([line(), lines.join("\n"), line()].join("\n"));

    await interaction.reply({ embeds: [embed] });
  }
}
