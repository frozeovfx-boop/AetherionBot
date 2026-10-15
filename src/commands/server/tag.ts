import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

export default class TagCommand extends Command {
  constructor() {
    super({
      name: "tag",
      description: "Özel sunucu etiketleri / kısayollar",
      category: "server",
      cooldown: 3,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("tag")
        .setDescription("Özel sunucu etiketleri")
        .addSubcommand((s) =>
          s
            .setName("olustur")
            .setDescription("Tag oluştur")
            .addStringOption((o) => o.setName("isim").setDescription("Tag adı").setRequired(true))
            .addStringOption((o) => o.setName("icerik").setDescription("İçerik").setRequired(true))
        )
        .addSubcommand((s) =>
          s
            .setName("sil")
            .setDescription("Tag sil")
            .addStringOption((o) => o.setName("isim").setDescription("Tag adı").setRequired(true))
        )
        .addSubcommand((s) =>
          s
            .setName("goster")
            .setDescription("Tag göster")
            .addStringOption((o) => o.setName("isim").setDescription("Tag adı").setRequired(true))
        )
        .addSubcommand((s) => s.setName("liste").setDescription("Tüm tagler"))
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const sub = interaction.options.getSubcommand();
    const tags = client.settings.get(interaction.guild.id).tags;

    if (sub === "olustur") {
      if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages)) {
        await interaction.reply({ content: "Yetkin yok.", ephemeral: true });
        return;
      }
      const name = interaction.options.getString("isim", true).toLowerCase().replace(/\s+/g, "-").slice(0, 32);
      const content = interaction.options.getString("icerik", true).slice(0, 1900);
      client.settings.setTag(interaction.guild.id, name, content);
      await interaction.reply({
        embeds: [
          baseEmbed(Theme.success)
            .setAuthor({ name: "TAG" })
            .setDescription([line(), kv("İsim", code(name)), line()].join("\n")),
        ],
      });
      return;
    }

    if (sub === "sil") {
      if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages)) {
        await interaction.reply({ content: "Yetkin yok.", ephemeral: true });
        return;
      }
      const name = interaction.options.getString("isim", true).toLowerCase();
      client.settings.setTag(interaction.guild.id, name, null);
      await interaction.reply({
        embeds: [baseEmbed(Theme.mute).setDescription(`Tag silindi: ${code(name)}`)],
      });
      return;
    }

    if (sub === "liste") {
      const keys = Object.keys(tags);
      const embed = baseEmbed(Theme.primary)
        .setAuthor({ name: "TAG" })
        .setTitle(`Tagler · ${keys.length}`)
        .setDescription(
          [line(), keys.length ? keys.map((k) => code(k)).join(" ") : "Boş", line()].join("\n")
        );
      await interaction.reply({ embeds: [embed] });
      return;
    }

    const name = interaction.options.getString("isim", true).toLowerCase();
    const content = tags[name];
    if (!content) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.warning).setDescription("Tag bulunamadı.")],
        ephemeral: true,
      });
      return;
    }

    await interaction.reply({
      embeds: [
        baseEmbed(Theme.primary)
          .setAuthor({ name: `TAG · ${name}` })
          .setDescription([line(), content, line()].join("\n")),
      ],
    });
  }
}
