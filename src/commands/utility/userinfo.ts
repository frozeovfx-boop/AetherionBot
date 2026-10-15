import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

export default class UserinfoCommand extends Command {
  constructor() {
    super({
      name: "userinfo",
      description: "Kullanıcı bilgileri",
      category: "utility",
      cooldown: 3,
      data: new SlashCommandBuilder()
        .setName("userinfo")
        .setDescription("Kullanıcı bilgileri")
        .addUserOption((o) => o.setName("kullanici").setDescription("Hedef").setRequired(false))
        .toJSON(),
    });
  }

  public async execute(_client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser("kullanici") ?? interaction.user;
    const member = interaction.guild
      ? await interaction.guild.members.fetch(user.id).catch(() => null)
      : null;

    const roles =
      member?.roles.cache
        .filter((r) => r.id !== interaction.guild!.id)
        .sort((a, b) => b.position - a.position)
        .map((r) => r.toString())
        .slice(0, 12)
        .join(" ") || "—";

    const embed = baseEmbed(Theme.primary)
      .setAuthor({ name: "USER", iconURL: user.displayAvatarURL({ size: 64 }) })
      .setTitle(user.tag)
      .setThumbnail(user.displayAvatarURL({ size: 256 }))
      .setDescription(
        [
          line(),
          kv("ID", code(user.id)),
          kv("Hesap", `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`),
          member
            ? kv("Katılım", `<t:${Math.floor(member.joinedTimestamp! / 1000)}:R>`)
            : null,
          member ? kv("Takma ad", member.nickname ?? "—") : null,
          member ? kv("Roller", roles) : null,
          line(),
        ]
          .filter(Boolean)
          .join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
}
