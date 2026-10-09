import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class RoleCommand extends Command {
  constructor() {
    super({
      name: "role",
      description: "Kullanıcıya rol verir veya alır",
      category: "moderation",
      cooldown: 3,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageRoles],
      clientPermissions: [PermissionFlagsBits.ManageRoles],
      data: new SlashCommandBuilder()
        .setName("role")
        .setDescription("Kullanıcıya rol verir veya alır")
        .addUserOption((opt) =>
          opt.setName("kullanici").setDescription("Hedef kullanıcı").setRequired(true)
        )
        .addRoleOption((opt) =>
          opt.setName("rol").setDescription("Rol").setRequired(true)
        )
        .addStringOption((opt) =>
          opt
            .setName("islem")
            .setDescription("İşlem")
            .setRequired(true)
            .addChoices(
              { name: "Ver", value: "add" },
              { name: "Al", value: "remove" }
            )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const target = interaction.options.getUser("kullanici", true);
    const role = interaction.options.getRole("rol", true);
    const action = interaction.options.getString("islem", true);

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member) {
      await interaction.reply({ content: "Kullanıcı sunucuda bulunamadı.", ephemeral: true });
      return;
    }

    if (role.managed || role.position >= interaction.guild.members.me!.roles.highest.position) {
      await interaction.reply({ content: "Bu rolü yönetemiyorum.", ephemeral: true });
      return;
    }

    if (action === "add") {
      if (member.roles.cache.has(role.id)) {
        await interaction.reply({ content: "Kullanıcıda zaten bu rol var.", ephemeral: true });
        return;
      }
      await member.roles.add(role, `Role add | Yetkili: ${interaction.user.tag}`);
    } else {
      if (!member.roles.cache.has(role.id)) {
        await interaction.reply({ content: "Kullanıcıda bu rol yok.", ephemeral: true });
        return;
      }
      await member.roles.remove(role, `Role remove | Yetkili: ${interaction.user.tag}`);
    }

    const embed = new EmbedBuilder()
      .setColor(action === "add" ? 0x57f287 : 0xed4245)
      .setTitle(action === "add" ? "Rol Verildi" : "Rol Alındı")
      .addFields(
        { name: "Kullanıcı", value: `${target.tag}`, inline: true },
        { name: "Rol", value: `${role}`, inline: true },
        { name: "Yetkili", value: `${interaction.user.tag}`, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
