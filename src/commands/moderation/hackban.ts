import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, code, kv } from "../../utils/embeds.js";

export default class HackbanCommand extends Command {
  constructor() {
    super({
      name: "hackban",
      description: "ID ile yasaklar (sunucuda olmasa da)",
      category: "moderation",
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.BanMembers],
      clientPermissions: [PermissionFlagsBits.BanMembers],
      data: new SlashCommandBuilder()
        .setName("hackban")
        .setDescription("ID ile yasaklar")
        .addStringOption((o) => o.setName("id").setDescription("Kullanıcı ID").setRequired(true))
        .addStringOption((o) => o.setName("sebep").setDescription("Sebep").setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const id = interaction.options.getString("id", true);
    const reason = interaction.options.getString("sebep") ?? "Hackban";

    if (!/^\d{17,20}$/.test(id)) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.warning).setDescription("Geçersiz ID.")],
        ephemeral: true,
      });
      return;
    }

    try {
      await interaction.guild.members.ban(id, { reason: `${reason} · ${interaction.user.tag}` });
    } catch {
      await interaction.reply({
        embeds: [baseEmbed(Theme.danger).setDescription("Yasaklanamadı.")],
        ephemeral: true,
      });
      return;
    }

    const modCase = client.cases.create({
      guildId: interaction.guild.id,
      userId: id,
      moderatorId: interaction.user.id,
      type: "ban",
      reason,
    });

    const embed = baseEmbed(Theme.mod)
      .setAuthor({ name: "MODERASYON" })
      .setTitle("Hackban")
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
