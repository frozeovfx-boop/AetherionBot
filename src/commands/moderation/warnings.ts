import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class WarningsCommand extends Command {
  constructor() {
    super({
      name: "warnings",
      description: "Kullanıcının uyarılarını listeler",
      category: "moderation",
      cooldown: 3,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ModerateMembers],
      data: new SlashCommandBuilder()
        .setName("warnings")
        .setDescription("Kullanıcının uyarılarını listeler")
        .addUserOption((opt) =>
          opt.setName("kullanici").setDescription("Hedef").setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const target = interaction.options.getUser("kullanici", true);
    const warns = client.cases.getUserCases(interaction.guild.id, target.id).filter((c) => c.type === "warn" && c.active);
    if (warns.length === 0) {
      await interaction.reply({ content: "Aktif uyarı yok.", ephemeral: true });
      return;
    }
    const lines = warns.map((c) => `\`#${c.id}\` ${c.reason.slice(0, 60)} — <t:${Math.floor(c.createdAt.getTime()/1000)}:R>`).join("\n");
    const embed = new EmbedBuilder()
      .setColor(0xfee75c)
      .setTitle(`Uyarılar — ${target.tag}`)
      .setDescription(lines)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
}
