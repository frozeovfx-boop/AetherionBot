import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

export default class AutoroleCommand extends Command {
  constructor() {
    super({
      name: "autorole",
      description: "Yeni üyelere otomatik rol",
      category: "server",
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageRoles],
      data: new SlashCommandBuilder()
        .setName("autorole")
        .setDescription("Yeni üyelere otomatik rol")
        .addSubcommand((s) =>
          s
            .setName("ekle")
            .setDescription("Autorole ekle")
            .addRoleOption((o) => o.setName("rol").setDescription("Rol").setRequired(true))
        )
        .addSubcommand((s) =>
          s
            .setName("cikar")
            .setDescription("Autorole kaldır")
            .addRoleOption((o) => o.setName("rol").setDescription("Rol").setRequired(true))
        )
        .addSubcommand((s) => s.setName("liste").setDescription("Autorole listesi"))
        .addSubcommand((s) => s.setName("temizle").setDescription("Tüm autorole'leri sil"))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const sub = interaction.options.getSubcommand();

    if (sub === "ekle") {
      const role = interaction.options.getRole("rol", true);
      if (role.managed || role.id === interaction.guild.id) {
        await interaction.reply({
          embeds: [baseEmbed(Theme.warning).setDescription("Bu rol kullanılamaz.")],
          ephemeral: true,
        });
        return;
      }
      client.settings.addAutorole(interaction.guild.id, role.id);
    } else if (sub === "cikar") {
      const role = interaction.options.getRole("rol", true);
      client.settings.removeAutorole(interaction.guild.id, role.id);
    } else if (sub === "temizle") {
      client.settings.setAutoroles(interaction.guild.id, []);
    }

    const ids = client.settings.get(interaction.guild.id).autoroleIds;
    const list =
      ids.length === 0
        ? "Yok"
        : ids.map((id) => interaction.guild!.roles.cache.get(id)?.toString() ?? code(id)).join(" ");

    const embed = baseEmbed(Theme.success)
      .setAuthor({ name: "SERVER" })
      .setTitle("Autorole")
      .setDescription([line(), kv("Roller", list), line()].join("\n"));

    await interaction.reply({ embeds: [embed] });
  }
}
