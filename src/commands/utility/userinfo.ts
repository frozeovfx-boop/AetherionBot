import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, code, divider } from "../../utils/embeds.js";

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
        .addUserOption((opt) =>
          opt.setName("kullanici").setDescription("Hedef").setRequired(false)
        )
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser("kullanici") ?? interaction.user;
    const member = interaction.guild
      ? await interaction.guild.members.fetch(user.id).catch(() => null)
      : null;

    const roles =
      member?.roles.cache
        .filter((r) => r.id !== interaction.guild!.id)
        .sort((a, b) => b.position - a.position)
        .map((r) => r.toString())
        .slice(0, 8)
        .join(" ") || "—";

    const embed = baseEmbed(Theme.primary)
      .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL({ size: 128 }) })
      .setThumbnail(user.displayAvatarURL({ size: 256 }))
      .setDescription(
        [
          divider(),
          `**ID**           ${code(user.id)}`,
          `**Hesap**        <t:${Math.floor(user.createdTimestamp / 1000)}:R>`,
          member
            ? `**Katılma**      <t:${Math.floor(member.joinedTimestamp! / 1000)}:R>`
            : null,
          member?.nickname ? `**Takma ad**     ${code(member.nickname)}` : null,
          divider(),
          member ? `**Roller**\n${roles}` : null,
        ]
          .filter(Boolean)
          .join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
}
