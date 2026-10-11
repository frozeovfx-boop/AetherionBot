import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

export default class RoleinfoCommand extends Command {
  constructor() {
    super({
      name: "roleinfo",
      description: "Rol bilgisi",
      category: "utility",
      cooldown: 3,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("roleinfo")
        .setDescription("Rol bilgisi")
        .addRoleOption((o) => o.setName("rol").setDescription("Rol").setRequired(true))
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const role = interaction.options.getRole("rol", true);

    const embed = baseEmbed(role.color || Theme.primary)
      .setAuthor({ name: "ROLE" })
      .setTitle(role.name)
      .setDescription(
        [
          line(),
          kv("ID", code(role.id)),
          kv("Renk", code(`#${role.color.toString(16).padStart(6, "0")}`)),
          kv("Üye", code(role.members?.size ?? "—")),
          kv("Mentionable", role.mentionable ? "Evet" : "Hayır"),
          kv("Hoist", role.hoist ? "Evet" : "Hayır"),
          kv("Pozisyon", code(role.position)),
          line(),
        ].join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
}
