import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class MassBanCommand extends Command {
  constructor() {
    super({
      name: "massban",
      description: "Birden fazla kullanıcıyı yasaklar (ID listesi)",
      category: "moderation",
      cooldown: 15,
      guildOnly: true,
      permissions: [PermissionFlagsBits.BanMembers],
      clientPermissions: [PermissionFlagsBits.BanMembers],
      data: new SlashCommandBuilder()
        .setName("massban")
        .setDescription("Birden fazla kullanıcıyı yasaklar (ID listesi)")
        .addStringOption((opt) =>
          opt
            .setName("idler")
            .setDescription("Yasaklanacak kullanıcı ID'leri (boşluk veya virgülle ayır)")
            .setRequired(true)
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

    const raw = interaction.options.getString("idler", true);
    const reason = interaction.options.getString("sebep") ?? "Massban";
    const ids = [...new Set(raw.split(/[\s,]+/).map((s) => s.trim()).filter((id) => /^\d{17,20}$/.test(id)))];

    if (ids.length === 0) {
      await interaction.reply({ content: "Geçerli kullanıcı ID'si bulunamadı.", ephemeral: true });
      return;
    }

    if (ids.length > 25) {
      await interaction.reply({ content: "Tek seferde en fazla 25 kullanıcı yasaklayabilirsin.", ephemeral: true });
      return;
    }

    await interaction.deferReply();

    let success = 0;
    let failed = 0;

    for (const id of ids) {
      if (id === interaction.user.id || id === client.user?.id) {
        failed++;
        continue;
      }
      try {
        await interaction.guild.members.ban(id, {
          reason: `Massban | ${reason} | Yetkili: ${interaction.user.tag}`,
        });
        success++;
      } catch {
        failed++;
      }
    }

    const embed = new EmbedBuilder()
      .setColor(0xed4245)
      .setTitle("Massban Tamamlandı")
      .addFields(
        { name: "Başarılı", value: `${success}`, inline: true },
        { name: "Başarısız", value: `${failed}`, inline: true },
        { name: "Sebep", value: reason }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }
}
