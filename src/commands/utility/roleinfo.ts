import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class RoleInfoCommand extends Command {
  constructor() {
    super({
      name: "roleinfo",
      description: "Rol hakkında bilgi gösterir",
      category: "utility",
      cooldown: 3,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("roleinfo")
        .setDescription("Rol hakkında bilgi gösterir")
        .addRoleOption((opt) =>
          opt.setName("rol").setDescription("Rol").setRequired(true)
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const role = interaction.options.getRole("rol", true);

    const embed = new EmbedBuilder()
      .setColor(role.color || 0x5865f2)
      .setTitle(`Rol: ${role.name}`)
      .addFields(
        { name: "ID", value: role.id, inline: true },
        { name: "Renk", value: role.hexColor, inline: true },
        { name: "Üye Sayısı", value: `${role.members?.size ?? "—"}`, inline: true },
        { name: "Mentionable", value: role.mentionable ? "Evet" : "Hayır", inline: true },
        { name: "Hoisted", value: role.hoist ? "Evet" : "Hayır", inline: true },
        { name: "Pozisyon", value: `${role.position}`, inline: true },
        { name: "Oluşturulma", value: `<t:${Math.floor(role.createdTimestamp / 1000)}:R>`, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
