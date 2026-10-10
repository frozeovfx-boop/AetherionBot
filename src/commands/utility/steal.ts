import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class StealCommand extends Command {
  constructor() {
    super({
      name: "steal",
      description: "Başka sunucudan emoji çalar",
      category: "utility",
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageGuildExpressions],
      clientPermissions: [PermissionFlagsBits.ManageGuildExpressions],
      data: new SlashCommandBuilder()
        .setName("steal")
        .setDescription("Başka sunucudan emoji çalar")
        .addStringOption((opt) =>
          opt.setName("emoji").setDescription("Emoji").setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuildExpressions)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const raw = interaction.options.getString("emoji", true);
    const match = raw.match(/<a?:(\w+):(\d+)>/);
    if (!match) {
      await interaction.reply({ content: "Geçerli özel emoji gir.", ephemeral: true });
      return;
    }
    const [, name, id] = match;
    const animated = raw.startsWith("<a:");
    const url = `https://cdn.discordapp.com/emojis/${id}.${animated ? "gif" : "png"}`;
    try {
      const emoji = await interaction.guild.emojis.create({ attachment: url, name: name! });
      const embed = new EmbedBuilder()
        .setColor(0x57f287)
        .setDescription(`Emoji eklendi: ${emoji}`)
        .setTimestamp();
      await interaction.reply({ embeds: [embed] });
    } catch {
      await interaction.reply({ content: "Emoji eklenemedi (limit veya yetki).", ephemeral: true });
    }
  }
}
