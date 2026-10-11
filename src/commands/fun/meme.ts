import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line } from "../../utils/embeds.js";

export default class MemeCommand extends Command {
  constructor() {
    super({
      name: "meme",
      description: "Rastgele meme",
      category: "fun",
      cooldown: 5,
      data: new SlashCommandBuilder().setName("meme").setDescription("Rastgele meme").toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();

    try {
      const res = await fetch("https://meme-api.com/gimme", {
        headers: { "User-Agent": "AetherionBot" },
      });
      if (!res.ok) throw new Error("api");
      const data = (await res.json()) as { title?: string; url?: string; subreddit?: string; author?: string };

      if (!data.url) throw new Error("no url");

      const embed = baseEmbed(Theme.fun)
        .setAuthor({ name: "MEME" })
        .setTitle((data.title ?? "Meme").slice(0, 200))
        .setImage(data.url)
        .setDescription(data.subreddit ? `r/${data.subreddit}` : null)
        .setFooter({ text: data.author ? `u/${data.author}` : "Aetherion" });

      await interaction.editReply({ embeds: [embed] });
    } catch {
      await interaction.editReply({
        embeds: [baseEmbed(Theme.danger).setDescription("Meme alınamadı.")],
      });
    }
  }
}
