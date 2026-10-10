import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { buildModEmbed } from "../../utils/modlog.js";

export default class HackbanCommand extends Command {
  constructor() {
    super({
      name: "hackban",
      description: "Sunucuda olmayan kullanıcıyı ID ile yasaklar",
      category: "moderation",
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.BanMembers],
      clientPermissions: [PermissionFlagsBits.BanMembers],
      data: new SlashCommandBuilder()
        .setName("hackban")
        .setDescription("Sunucuda olmayan kullanıcıyı ID ile yasaklar")
        .addStringOption((opt) =>
          opt.setName("id").setDescription("Kullanıcı ID").setRequired(true)
        )
        .addStringOption((opt) =>
          opt.setName("sebep").setDescription("Sebep").setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const id = interaction.options.getString("id", true);
    const reason = interaction.options.getString("sebep") ?? "Hackban";
    if (!/^\d{17,20}$/.test(id)) {
      await interaction.reply({ content: "Geçersiz ID.", ephemeral: true });
      return;
    }
    try {
      await interaction.guild.members.ban(id, { reason: `${reason} | ${interaction.user.tag}` });
    } catch {
      await interaction.reply({ content: "Yasaklanamadı.", ephemeral: true });
      return;
    }
    const modCase = client.cases.create({
      guildId: interaction.guild.id,
      userId: id,
      moderatorId: interaction.user.id,
      type: "ban",
      reason,
    });
    const embed = buildModEmbed({
      type: "ban",
      userTag: id,
      userId: id,
      moderatorTag: interaction.user.tag,
      reason,
      caseId: modCase.id,
    });
    await interaction.reply({ embeds: [embed] });
  }
}
