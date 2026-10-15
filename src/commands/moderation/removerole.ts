import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, kv } from "../../utils/embeds.js";

export default class RemoveRoleCommand extends Command {
  constructor() {
    super({
      name: "removerole",
      description: "Kullanıcıdan rol alır",
      category: "moderation",
      cooldown: 3,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageRoles],
      clientPermissions: [PermissionFlagsBits.ManageRoles],
      data: new SlashCommandBuilder()
        .setName("removerole")
        .setDescription("Kullanıcıdan rol alır")
        .addUserOption((o) => o.setName("kullanici").setDescription("Hedef").setRequired(true))
        .addRoleOption((o) => o.setName("rol").setDescription("Rol").setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const target = interaction.options.getUser("kullanici", true);
    const role = interaction.options.getRole("rol", true);
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);

    if (!member) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.danger).setDescription("Kullanıcı bulunamadı.")],
        ephemeral: true,
      });
      return;
    }

    if (!member.roles.cache.has(role.id)) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.warning).setDescription("Bu role sahip değil.")],
        ephemeral: true,
      });
      return;
    }

    await member.roles.remove(role.id, `removerole · ${interaction.user.tag}`);

    const embed = baseEmbed(Theme.danger)
      .setAuthor({ name: "MODERASYON" })
      .setTitle("Rol Alındı")
      .setDescription(
        [
          line(),
          kv("Kullanıcı", target.tag),
          kv("Rol", `${role}`),
          kv("Yetkili", interaction.user.tag),
          line(),
        ].join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
}
