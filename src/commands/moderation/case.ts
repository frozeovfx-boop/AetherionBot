import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class CaseCommand extends Command {
  constructor() {
    super({
      name: "case",
      description: "Belirli bir case kaydını gösterir",
      category: "moderation",
      cooldown: 3,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ModerateMembers],
      data: new SlashCommandBuilder()
        .setName("case")
        .setDescription("Belirli bir case kaydını gösterir")
        .addIntegerOption((opt) =>
          opt.setName("id").setDescription("Case ID").setRequired(true).setMinValue(1)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const id = interaction.options.getInteger("id", true);
    const modCase = client.cases.get(interaction.guild.id, id);

    if (!modCase) {
      await interaction.reply({ content: `Case #${id} bulunamadı.`, ephemeral: true });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(modCase.active ? 0x5865f2 : 0x99aab5)
      .setTitle(`Case #${modCase.id}`)
      .addFields(
        { name: "Tür", value: modCase.type, inline: true },
        { name: "Durum", value: modCase.active ? "Aktif" : "Pasif", inline: true },
        { name: "Kullanıcı", value: `<@${modCase.userId}> (\`${modCase.userId}\`)`, inline: true },
        { name: "Yetkili", value: `<@${modCase.moderatorId}>`, inline: true },
        { name: "Tarih", value: `<t:${Math.floor(modCase.createdAt.getTime() / 1000)}:F>`, inline: true },
        { name: "Sebep", value: modCase.reason }
      )
      .setTimestamp();

    if (modCase.duration) {
      embed.addFields({ name: "Süre", value: `${Math.floor(modCase.duration / 1000)}s`, inline: true });
    }

    await interaction.reply({ embeds: [embed] });
  }
}
