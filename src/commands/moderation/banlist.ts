import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, code } from "../../utils/embeds.js";

export default class BanlistCommand extends Command {
  constructor() {
    super({
      name: "banlist",
      description: "Yasaklı kullanıcılar",
      category: "moderation",
      cooldown: 10,
      guildOnly: true,
      permissions: [PermissionFlagsBits.BanMembers],
      data: new SlashCommandBuilder()
        .setName("banlist")
        .setDescription("Yasaklı kullanıcılar")
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    await interaction.deferReply({ ephemeral: true });

    const bans = await interaction.guild.bans.fetch();
    if (bans.size === 0) {
      await interaction.editReply({
        embeds: [baseEmbed(Theme.mute).setDescription("Yasaklı kullanıcı yok.")],
      });
      return;
    }

    const lines = [...bans.values()]
      .slice(0, 15)
      .map((b) => `• **${b.user.tag}**  ${code(b.user.id)}\n　　${b.reason ?? "sebep yok"}`)
      .join("\n\n");

    const embed = baseEmbed(Theme.mod)
      .setAuthor({ name: "MODERASYON" })
      .setTitle(`Ban Listesi · ${bans.size}`)
      .setDescription([line(), lines, line()].join("\n"));

    await interaction.editReply({ embeds: [embed] });
  }
}
