import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

function onOff(v: boolean): string {
  return v ? "**Açık**" : code("kapalı");
}

export default class AutomodCommand extends Command {
  constructor() {
    super({
      name: "automod",
      description: "Hafif automod ayarları",
      category: "server",
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageGuild],
      data: new SlashCommandBuilder()
        .setName("automod")
        .setDescription("Hafif automod ayarları")
        .addSubcommand((s) => s.setName("durum").setDescription("Mevcut ayarlar"))
        .addSubcommand((s) =>
          s
            .setName("davet")
            .setDescription("Discord davet linki engeli")
            .addBooleanOption((o) => o.setName("acik").setDescription("Açık/kapalı").setRequired(true))
        )
        .addSubcommand((s) =>
          s
            .setName("link")
            .setDescription("Genel http(s) link engeli")
            .addBooleanOption((o) => o.setName("acik").setDescription("Açık/kapalı").setRequired(true))
        )
        .addSubcommand((s) =>
          s
            .setName("spam")
            .setDescription("Kısa sürede çok mesaj engeli")
            .addBooleanOption((o) => o.setName("acik").setDescription("Açık/kapalı").setRequired(true))
        )
        .addSubcommand((s) =>
          s
            .setName("mention")
            .setDescription("Maksimum mention sayısı (0 = kapalı)")
            .addIntegerOption((o) =>
              o.setName("limit").setDescription("0-20").setRequired(true).setMinValue(0).setMaxValue(20)
            )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const sub = interaction.options.getSubcommand();
    const gid = interaction.guild.id;

    if (sub === "davet") {
      client.settings.setAutomod(gid, {
        automodAntiInvite: interaction.options.getBoolean("acik", true),
      });
    } else if (sub === "link") {
      client.settings.setAutomod(gid, {
        automodAntiLink: interaction.options.getBoolean("acik", true),
      });
    } else if (sub === "spam") {
      client.settings.setAutomod(gid, {
        automodAntiSpam: interaction.options.getBoolean("acik", true),
      });
    } else if (sub === "mention") {
      client.settings.setAutomod(gid, {
        automodMaxMentions: interaction.options.getInteger("limit", true),
      });
    }

    const cfg = client.settings.get(gid);
    const embed = baseEmbed(Theme.primary)
      .setAuthor({ name: "AUTOMOD" })
      .setDescription(
        [
          line(),
          kv("Davet engeli", onOff(cfg.automodAntiInvite)),
          kv("Link engeli", onOff(cfg.automodAntiLink)),
          kv("Spam engeli", onOff(cfg.automodAntiSpam)),
          kv("Mention limit", cfg.automodMaxMentions === 0 ? code("kapalı") : code(cfg.automodMaxMentions)),
          line(),
          "Manage Messages yetkisi olanlar ve botlar muaf.",
        ].join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
}
