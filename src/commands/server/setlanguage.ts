import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { setGuildLocale, tg, LOCALES, isLocale, type Locale } from "../../i18n/index.js";
import { Theme, baseEmbed, divider } from "../../utils/embeds.js";

export default class SetLanguageCommand extends Command {
  constructor() {
    super({
      name: "setlanguage",
      description: "Sunucu dilini ayarlar / Set server language",
      category: "server",
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageGuild],
      data: new SlashCommandBuilder()
        .setName("setlanguage")
        .setDescription("Set server language / Sunucu dili")
        .addStringOption((opt) =>
          opt
            .setName("dil")
            .setDescription("Language")
            .setRequired(true)
            .addChoices(
              { name: "Türkçe", value: "tr" },
              { name: "English", value: "en" },
              { name: "Deutsch", value: "de" },
              { name: "Français", value: "fr" },
              { name: "Español", value: "es" },
              { name: "Português", value: "pt" },
              { name: "Русский", value: "ru" },
              { name: "日本語", value: "ja" },
              { name: "العربية", value: "ar" },
              { name: "हिन्दी", value: "hi" }
            )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const raw = interaction.options.getString("dil", true);
    if (!isLocale(raw)) {
      await interaction.reply({
        content: tg(interaction.guild.id, "lang.invalid"),
        ephemeral: true,
      });
      return;
    }

    const locale: Locale = raw;
    setGuildLocale(interaction.guild.id, locale);

    const label = LOCALES.find((l) => l.code === locale)?.label ?? locale;

    const embed = baseEmbed(Theme.success)
      .setTitle(`◈ ${tg(interaction.guild.id, "lang.title")}`)
      .setDescription(
        [
          divider(),
          tg(interaction.guild.id, "lang.set", { lang: label }),
          divider(),
        ].join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
}
