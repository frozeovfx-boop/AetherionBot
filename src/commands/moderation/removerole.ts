import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

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
        .addUserOption((opt) =>
          opt.setName("kullanici").setDescription("Hedef").setRequired(true)
        )
        .addRoleOption((opt) =>
          opt.setName("rol").setDescription("Rol").setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const target = interaction.options.getUser("kullanici", true);
    const role = interaction.options.getRole("rol", true);
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);

    if (!member) {
      await interaction.reply({ content: "Kullanıcı bulunamadı.", ephemeral: true });
      return;
    }

    if (!member.roles.cache.has(role.id)) {
      await interaction.reply({ content: "Bu role sahip değil.", ephemeral: true });
      return;
    }

    await member.roles.remove(role, `Removerole | ${interaction.user.tag}`);

    const embed = new EmbedBuilder()
      .setColor(0xed4245)
      .setDescription(`${target} kullanıcısından ${role} rolü alındı.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
