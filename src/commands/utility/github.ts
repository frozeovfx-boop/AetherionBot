import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class GithubCommand extends Command {
  constructor() {
    super({
      name: "github",
      description: "GitHub kullanıcı bilgisi",
      category: "utility",
      cooldown: 5,
      data: new SlashCommandBuilder()
        .setName("github")
        .setDescription("GitHub kullanıcı bilgisi")
        .addStringOption((opt) =>
          opt.setName("kullanici").setDescription("GitHub username").setRequired(true)
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const username = interaction.options.getString("kullanici", true);
    await interaction.deferReply();
    try {
      const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
        headers: { "User-Agent": "AetherionBot" },
      });
      if (!res.ok) {
        await interaction.editReply({ content: "Kullanıcı bulunamadı." });
        return;
      }
      const u = (await res.json()) as {
        login: string; name: string | null; bio: string | null; public_repos: number;
        followers: number; following: number; html_url: string; avatar_url: string; created_at: string;
      };
      const embed = new EmbedBuilder()
        .setColor(0x24292e)
        .setAuthor({ name: u.login, iconURL: u.avatar_url, url: u.html_url })
        .setDescription(u.bio ?? "*bio yok*")
        .addFields(
          { name: "Repolar", value: `${u.public_repos}`, inline: true },
          { name: "Takipçi", value: `${u.followers}`, inline: true },
          { name: "Takip", value: `${u.following}`, inline: true }
        )
        .setThumbnail(u.avatar_url)
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch {
      await interaction.editReply({ content: "GitHub API hatası." });
    }
  }
}
