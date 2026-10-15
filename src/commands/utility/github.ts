import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

export default class GithubCommand extends Command {
  constructor() {
    super({
      name: "github",
      description: "GitHub kullanıcı bilgisi",
      category: "utility",
      cooldown: 8,
      data: new SlashCommandBuilder()
        .setName("github")
        .setDescription("GitHub kullanıcı bilgisi")
        .addStringOption((o) => o.setName("kullanici").setDescription("GitHub username").setRequired(true))
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const username = interaction.options.getString("kullanici", true);
    await interaction.deferReply();

    try {
      const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
        headers: { "User-Agent": "YutaBot", Accept: "application/vnd.github+json" },
      });
      if (!res.ok) throw new Error("not found");
      const u = (await res.json()) as {
        login: string;
        name?: string;
        bio?: string;
        public_repos: number;
        followers: number;
        following: number;
        html_url: string;
        avatar_url: string;
        created_at: string;
      };

      const embed = baseEmbed(Theme.primary)
        .setAuthor({ name: "GITHUB", iconURL: u.avatar_url })
        .setTitle(u.name ?? u.login)
        .setURL(u.html_url)
        .setThumbnail(u.avatar_url)
        .setDescription(
          [
            u.bio ? `*${u.bio.slice(0, 200)}*` : null,
            line(),
            kv("Kullanıcı", code(u.login)),
            kv("Repo", code(u.public_repos)),
            kv("Takipçi", code(u.followers)),
            kv("Takip", code(u.following)),
            line(),
          ]
            .filter(Boolean)
            .join("\n")
        );

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setLabel("Profil").setStyle(ButtonStyle.Link).setURL(u.html_url)
      );

      await interaction.editReply({ embeds: [embed], components: [row] });
    } catch {
      await interaction.editReply({
        embeds: [baseEmbed(Theme.danger).setDescription("Kullanıcı bulunamadı.")],
      });
    }
  }
}
