import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, kv } from "../../utils/embeds.js";

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

    if (role.managed || role.position >= interaction.guild.members.me!.roles.highest.position) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.danger).setDescription("Bu rolü veremiyorum.")],
        ephemeral: true,
      });
      return;
    }

    if (member.roles.cache.has(role.id)) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.warning).setDescription("Zaten bu role sahip.")],
        ephemeral: true,
      });
      return;
    }

    await member.roles.add(role.id, `addrole · ${interaction.user.tag}`);

    const embed = baseEmbed(Theme.success)
      .setAuthor({ name: "MODERASYON" })
      .setTitle("Rol Verildi")
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
