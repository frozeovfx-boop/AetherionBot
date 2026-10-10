import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class AddRoleCommand extends Command {
  constructor() {
    super({
      name: "addrole",
      description: "Kullanıcıya rol verir",
      category: "moderation",
      cooldown: 3,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageRoles],
      clientPermissions: [PermissionFlagsBits.ManageRoles],
      data: new SlashCommandBuilder()
        .setName("addrole")
        .setDescription("Kullanıcıya rol verir")
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

    if (role.managed || role.position >= interaction.guild.members.me!.roles.highest.position) {
      await interaction.reply({ content: "Bu rolü veremiyorum.", ephemeral: true });
      return;
    }

    if (member.roles.cache.has(role.id)) {
      await interaction.reply({ content: "Zaten bu role sahip.", ephemeral: true });
      return;
    }

    await member.roles.add(role, `Addrole | ${interaction.user.tag}`);

    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setDescription(`${target} kullanıcısına ${role} rolü verildi.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
