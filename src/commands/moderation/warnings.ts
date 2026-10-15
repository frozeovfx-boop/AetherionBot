import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, code } from "../../utils/embeds.js";

export default class WarningsCommand extends Command {
  constructor() {
    super({
      name: "warnings",
      description: "Kullanıcının uyarıları",
      category: "moderation",
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ModerateMembers],
      data: new SlashCommandBuilder()
        .setName("warnings")
        .setDescription("Kullanıcının uyarıları")
        .addUserOption((o) => o.setName("kullanici").setDescription("Hedef").setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const target = interaction.options.getUser("kullanici", true);
    const warns = client.cases
      .getUserCases(interaction.guild.id, target.id)
      .filter((c) => c.type === "warn" && c.active)
      .slice(0, 15);

    if (warns.length === 0) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.mute).setDescription("Aktif uyarı yok.")],
        ephemeral: true,
      });
      return;
    }

    const list = warns
      .map(
        (c) =>
          `${code(`#${c.id}`)}  ${c.reason.slice(0, 50)}\n　　<t:${Math.floor(c.createdAt.getTime() / 1000)}:R>`
      )
      .join("\n\n");

    const embed = baseEmbed(Theme.warning)
      .setAuthor({ name: "MODERASYON" })
      .setTitle(`Uyarılar · ${target.username}`)
      .setThumbnail(target.displayAvatarURL({ size: 256 }))
      .setDescription([line(), list, line()].join("\n"))
      .setFooter({ text: `${warns.length} aktif · Sukuna` });

    await interaction.reply({ embeds: [embed] });
  }
}
