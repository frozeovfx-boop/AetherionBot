import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class MemeCommand extends Command {
  constructor() {
    super({
      name: "meme",
      description: "Rastgele meme getirir",
      category: "fun",
      cooldown: 5,
      data: new SlashCommandBuilder()
        .setName("meme")
        .setDescription("Rastgele meme getirir")
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();

    try {
      const res = await fetch("https://meme-api.com/gimme");
      if (!res.ok) throw new Error("API error");
      const data = (await res.json()) as { title: string; url: string; postLink: string; subreddit: string };

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle(data.title.slice(0, 250))
        .setURL(data.postLink)
        .setImage(data.url)
        .setFooter({ text: `r/${data.subreddit}` })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch {
      await interaction.editReply({ content: "Meme alınamadı, biraz sonra tekrar dene." });
    }
  }
}
