import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { setGuildLocale, tg, LOCALES, type Locale } from "../../i18n/index.js";
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
        .setDescription("Sunucu dilini ayarlar / Set server language")
        .addStringOption((opt) =>
          opt
            .setName("dil")
            .setDescription("tr | en")
            .setRequired(true)
            .addChoices(
              { name: "Türkçe", value: "tr" },
              { name: "English", value: "en" }
            )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const locale = interaction.options.getString("dil", true) as Locale;
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
