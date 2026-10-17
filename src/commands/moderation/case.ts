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
      description: "Case detay / not",
      category: "moderation",
      cooldown: 3,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ModerateMembers],
      data: new SlashCommandBuilder()
        .setName("case")
        .setDescription("Case detay / not")
        .addSubcommand((s) =>
          s
            .setName("bak")
            .setDescription("Case detayı")
            .addIntegerOption((o) =>
              o.setName("id").setRequired(true).setMinValue(1)
            )
        )
        .addSubcommand((s) =>
          s
            .setName("not")
            .setDescription("Case'e not ekle")
            .addIntegerOption((o) =>
              o.setName("id").setDescription("id").setRequired(true).setMinValue(1)
            )
            .addStringOption((o) =>
              o.setName("metin").setRequired(true).setDescription("Not")
            )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const sub = interaction.options.getSubcommand();
    const id = interaction.options.getInteger("id", true);
    const c = client.cases.get(interaction.guild.id, id);

    if (!c) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.mute).setAuthor({ name: "MODERASYON" }).setDescription("Case bulunamadı.")],
        ephemeral: true,
      });
      return;
    }

    if (sub === "not") {
      const text = interaction.options.getString("metin", true);
      client.cases.addNote(interaction.guild.id, id, interaction.user.id, text);
      await interaction.reply({
        embeds: [
          baseEmbed(Theme.success)
            .setAuthor({ name: "MODERASYON" })
            .setDescription([line(), kv("Case", code(`#${id}`)), kv("Not", text.slice(0, 200)), line()].join("\n")),
        ],
      });
      return;
    }

    const notes = (c.notes ?? [])
      .slice(-5)
      .map((n) => `• <@${n.authorId}> — ${n.text} (<t:${Math.floor(n.at / 1000)}:R>)`)
      .join("\n");

    const embed = baseEmbed(Theme.mod)
      .setAuthor({ name: "MODERASYON" })
      .setTitle(`Case #${c.id}`)
      .setDescription(
        [
          line(),
          kv("Tip", c.type),
          kv("Kullanıcı", `<@${c.userId}>`),
          kv("Yetkili", `<@${c.moderatorId}>`),
          kv("Sebep", c.reason),
          kv("Aktif", c.active ? "Evet" : "Hayır"),
          c.expiresAt ? kv("Bitiş", `<t:${Math.floor(c.expiresAt / 1000)}:R>`) : null,
          kv("Tarih", `<t:${Math.floor(c.createdAt.getTime() / 1000)}:F>`),
          line(),
          notes ? `**Notlar**\n${notes}` : null,
        ]
          .filter(Boolean)
          .join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
}
