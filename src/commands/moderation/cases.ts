import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, code } from "../../utils/embeds.js";

export default class CasesCommand extends Command {
  constructor() {
    super({
      name: "cases",
      description: "Kullanıcının ceza geçmişi",
      category: "moderation",
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ModerateMembers],
      data: new SlashCommandBuilder()
        .setName("cases")
        .setDescription("Kullanıcının ceza geçmişi")
        .addUserOption((o) => o.setName("kullanici").setDescription("Hedef").setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const target = interaction.options.getUser("kullanici", true);
    const cases = client.cases.getUserCases(interaction.guild.id, target.id).slice(0, 12);

    if (cases.length === 0) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.mute).setDescription("Kayıt yok.")],
        ephemeral: true,
      });
      return;
    }

    const list = cases
      .map((c) => {
        const status = c.active ? "●" : "○";
        const reason = c.reason.slice(0, 48);
        return `${status}  ${code(`#${c.id}`)}  **${c.type}**\n　　${reason}`;
      })
      .join("\n\n");

    const embed = baseEmbed(Theme.mod)
      .setAuthor({ name: "MODERASYON" })
      .setTitle(`Geçmiş · ${target.username}`)
      .setThumbnail(target.displayAvatarURL({ size: 256 }))
      .setDescription([line(), list, line()].join("\n"))
      .setFooter({ text: `${cases.length} kayıt · Aetherion` });

    await interaction.reply({ embeds: [embed] });
  }
}
