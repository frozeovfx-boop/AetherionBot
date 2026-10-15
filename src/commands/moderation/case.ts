import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

export default class CaseCommand extends Command {
  constructor() {
    super({
      name: "case",
      description: "Case detayı",
      category: "moderation",
      cooldown: 3,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ModerateMembers],
      data: new SlashCommandBuilder()
        .setName("case")
        .setDescription("Case detayı")
        .addIntegerOption((o) => o.setName("id").setDescription("Case ID").setRequired(true).setMinValue(1))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const id = interaction.options.getInteger("id", true);
    const c = client.cases.get(interaction.guild.id, id);

    if (!c) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.mute).setDescription("Case bulunamadı.")],
        ephemeral: true,
      });
      return;
    }

    const embed = baseEmbed(Theme.mod)
      .setAuthor({ name: "MODERASYON" })
      .setTitle(`Case #${c.id}`)
      .setDescription(
        [
          line(),
          kv("Tip", c.type),
          kv("Kullanıcı", code(c.userId)),
          kv("Yetkili", code(c.moderatorId)),
          kv("Sebep", c.reason),
          kv("Aktif", c.active ? "Evet" : "Hayır"),
          kv("Tarih", `<t:${Math.floor(c.createdAt.getTime() / 1000)}:F>`),
          line(),
        ].join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
}
