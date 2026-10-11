import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

export default class MassbanCommand extends Command {
  constructor() {
    super({
      name: "massban",
      description: "Birden fazla ID yasakla",
      category: "moderation",
      cooldown: 15,
      guildOnly: true,
      permissions: [PermissionFlagsBits.BanMembers],
      clientPermissions: [PermissionFlagsBits.BanMembers],
      data: new SlashCommandBuilder()
        .setName("massban")
        .setDescription("Birden fazla ID yasakla")
        .addStringOption((o) =>
          o.setName("idler").setDescription("ID'ler (boşluk veya virgülle)").setRequired(true)
        )
        .addStringOption((o) => o.setName("sebep").setDescription("Sebep").setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const raw = interaction.options.getString("idler", true);
    const reason = interaction.options.getString("sebep") ?? "Massban";
    const ids = [...new Set(raw.split(/[\s,]+/).filter((id) => /^\d{17,20}$/.test(id)))].slice(0, 20);

    if (ids.length === 0) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.warning).setDescription("Geçerli ID bulunamadı.")],
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply();
    let ok = 0;
    let fail = 0;

    for (const id of ids) {
      try {
        await interaction.guild.members.ban(id, {
          reason: `Massban · ${reason} · ${interaction.user.tag}`,
        });
        client.cases.create({
          guildId: interaction.guild.id,
          userId: id,
          moderatorId: interaction.user.id,
          type: "ban",
          reason: `Massban · ${reason}`,
        });
        ok++;
      } catch {
        fail++;
      }
    }

    const embed = baseEmbed(Theme.mod)
      .setAuthor({ name: "MODERASYON" })
      .setTitle("Massban")
      .setDescription(
        [
          line(),
          kv("Başarılı", code(ok)),
          kv("Başarısız", code(fail)),
          kv("Yetkili", interaction.user.tag),
          kv("Sebep", reason),
          line(),
        ].join("\n")
      );

    await interaction.editReply({ embeds: [embed] });
  }
}
