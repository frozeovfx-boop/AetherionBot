import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, code, kv } from "../../utils/embeds.js";

export default class UnbanCommand extends Command {
  constructor() {
    super({
      name: "unban",
      description: "Yasağı kaldırır",
      category: "moderation",
      cooldown: 3,
      guildOnly: true,
      permissions: [PermissionFlagsBits.BanMembers],
      clientPermissions: [PermissionFlagsBits.BanMembers],
      data: new SlashCommandBuilder()
        .setName("unban")
        .setDescription("Yasağı kaldırır")
        .addStringOption((o) => o.setName("id").setDescription("Kullanıcı ID").setRequired(true))
        .addStringOption((o) => o.setName("sebep").setDescription("Sebep").setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const id = interaction.options.getString("id", true);
    const reason = interaction.options.getString("sebep") ?? "Belirtilmedi";

    if (!/^\d{17,20}$/.test(id)) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.warning).setDescription("Geçersiz ID.")],
        ephemeral: true,
      });
      return;
    }

    try {
      await interaction.guild.members.unban(id, `${reason} · ${interaction.user.tag}`);
    } catch {
      await interaction.reply({
        embeds: [baseEmbed(Theme.danger).setDescription("Yasak kaldırılamadı / kullanıcı yasaklı değil.")],
        ephemeral: true,
      });
      return;
    }

    const modCase = client.cases.create({
      guildId: interaction.guild.id,
      userId: id,
      moderatorId: interaction.user.id,
      type: "unban",
      reason,
    });

    const embed = baseEmbed(Theme.success)
      .setAuthor({ name: "MODERASYON" })
      .setTitle("Yasak Kaldırıldı")
      .setDescription(
        [
          line(),
          kv("ID", code(id)),
          kv("Yetkili", interaction.user.tag),
          kv("Sebep", reason),
          line(),
        ].join("\n")
      )
      .setFooter({ text: `Case #${modCase.id} · Aetherion` });

    await interaction.reply({ embeds: [embed] });
  }
}
