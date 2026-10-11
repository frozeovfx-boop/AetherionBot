import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, kv } from "../../utils/embeds.js";

export default class RoleCommand extends Command {
  constructor() {
    super({
      name: "role",
      description: "Rol ver / al (toggle)",
      category: "moderation",
      cooldown: 3,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageRoles],
      clientPermissions: [PermissionFlagsBits.ManageRoles],
      data: new SlashCommandBuilder()
        .setName("role")
        .setDescription("Rol ver / al (toggle)")
        .addUserOption((o) => o.setName("kullanici").setDescription("Hedef").setRequired(true))
        .addRoleOption((o) => o.setName("rol").setDescription("Rol").setRequired(true))
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
      await interaction.reply({
        embeds: [baseEmbed(Theme.danger).setDescription("Kullanıcı bulunamadı.")],
        ephemeral: true,
      });
      return;
    }

    if (role.managed || role.position >= interaction.guild.members.me!.roles.highest.position) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.danger).setDescription("Bu rolü yönetemiyorum.")],
        ephemeral: true,
      });
      return;
    }

    const has = member.roles.cache.has(role.id);
    if (has) {
      await member.roles.remove(role.id, `role toggle · ${interaction.user.tag}`);
    } else {
      await member.roles.add(role.id, `role toggle · ${interaction.user.tag}`);
    }

    const embed = baseEmbed(has ? Theme.danger : Theme.success)
      .setAuthor({ name: "MODERASYON" })
      .setTitle(has ? "Rol Alındı" : "Rol Verildi")
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
