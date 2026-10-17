import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  ChannelType,
  TextChannel,
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
      description: "Automod koruması",
      category: "server",
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageGuild],
      data: new SlashCommandBuilder()
        .setName("automod")
        .setDescription("Automod koruması")
        .addSubcommand((s) => s.setName("durum").setDescription("Tüm ayarlar"))
        .addSubcommand((s) =>
          s
            .setName("davet")
            .setDescription("Yabancı Discord davet engeli")
            .addBooleanOption((o) => o.setName("acik").setDescription("Açık/kapalı").setRequired(true))
        )
        .addSubcommand((s) =>
          s
            .setName("link")
            .setDescription("HTTP link engeli")
            .addBooleanOption((o) => o.setName("acik").setDescription("Açık/kapalı").setRequired(true))
        )
        .addSubcommand((s) =>
          s
            .setName("spam")
            .setDescription("Hızlı mesaj spam engeli")
            .addBooleanOption((o) => o.setName("acik").setDescription("Açık/kapalı").setRequired(true))
        )
        .addSubcommand((s) =>
          s
            .setName("kufur")
            .setDescription("Yasak kelime filtresi")
            .addBooleanOption((o) => o.setName("acik").setDescription("Açık/kapalı").setRequired(true))
        )
        .addSubcommand((s) =>
          s
            .setName("mention")
            .setDescription("Max etiket (0=kapalı)")
            .addIntegerOption((o) =>
              o.setName("limit").setDescription("Max mention (0=kapalı)").setRequired(true).setMinValue(0).setMaxValue(20)
            )
        )
        .addSubcommand((s) =>
          s
            .setName("kelime")
            .setDescription("Yasak kelime ekle/sil")
            .addStringOption((o) =>
              o
                .setName("islem").setDescription("İşlem")
                .setRequired(true)
                .addChoices(
                  { name: "Ekle", value: "ekle" },
                  { name: "Sil", value: "sil" },
                  { name: "Liste", value: "liste" }
                )
            )
            .addStringOption((o) => o.setName("metin").setDescription("Kelime").setRequired(false))
        )
        .addSubcommand((s) =>
          s
            .setName("muaf")
            .setDescription("Kanal muafiyeti")
            .addStringOption((o) =>
              o
                .setName("islem").setDescription("İşlem")
                .setRequired(true)
                .addChoices(
                  { name: "Ekle", value: "ekle" },
                  { name: "Sil", value: "sil" },
                  { name: "Liste", value: "liste" }
                )
            )
            .addChannelOption((o) =>
              o
                .setName("kanal").setDescription("Kanal")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false)
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
      client.settings.setAutomod(gid, { automodAntiInvite: interaction.options.getBoolean("acik", true) });
    } else if (sub === "link") {
      client.settings.setAutomod(gid, { automodAntiLink: interaction.options.getBoolean("acik", true) });
    } else if (sub === "spam") {
      client.settings.setAutomod(gid, { automodAntiSpam: interaction.options.getBoolean("acik", true) });
    } else if (sub === "kufur") {
      client.settings.setAutomod(gid, {
        automodAntiBadwords: interaction.options.getBoolean("acik", true),
      });
    } else if (sub === "mention") {
      client.settings.setAutomod(gid, {
        automodMaxMentions: interaction.options.getInteger("limit", true),
      });
    } else if (sub === "kelime") {
      const islem = interaction.options.getString("islem", true);
      const metin = interaction.options.getString("metin")?.toLowerCase().trim();
      const list = [...client.settings.get(gid).automodBadwords];
      if (islem === "liste") {
        await interaction.reply({
          embeds: [
            baseEmbed(Theme.primary)
              .setAuthor({ name: "AUTOMOD · KELİMELER" })
              .setDescription(
                [line(), list.length ? list.map((w) => code(w)).join(", ") : "Boş", line()].join("\n")
              ),
          ],
          ephemeral: true,
        });
        return;
      }
      if (!metin) {
        await interaction.reply({ content: "metin gerekli.", ephemeral: true });
        return;
      }
      if (islem === "ekle" && !list.includes(metin)) list.push(metin.slice(0, 40));
      if (islem === "sil") {
        const i = list.indexOf(metin);
        if (i >= 0) list.splice(i, 1);
      }
      client.settings.setAutomod(gid, { automodBadwords: list });
    } else if (sub === "muaf") {
      const islem = interaction.options.getString("islem", true);
      const ch = interaction.options.getChannel("kanal") as TextChannel | null;
      const list = [...client.settings.get(gid).automodIgnoreChannels];
      if (islem === "liste") {
        await interaction.reply({
          embeds: [
            baseEmbed(Theme.primary)
              .setAuthor({ name: "AUTOMOD · MUAF" })
              .setDescription(
                [
                  line(),
                  list.length ? list.map((id) => `<#${id}>`).join(" ") : "Yok",
                  line(),
                ].join("\n")
              ),
          ],
          ephemeral: true,
        });
        return;
      }
      if (!ch) {
        await interaction.reply({ content: "kanal seç.", ephemeral: true });
        return;
      }
      if (islem === "ekle" && !list.includes(ch.id)) list.push(ch.id);
      if (islem === "sil") {
        const i = list.indexOf(ch.id);
        if (i >= 0) list.splice(i, 1);
      }
      client.settings.setAutomod(gid, { automodIgnoreChannels: list });
    }

    const cfg = client.settings.get(gid);
    await interaction.reply({
      embeds: [
        baseEmbed(Theme.primary)
          .setAuthor({ name: "AUTOMOD" })
          .setDescription(
            [
              line(),
              kv("Davet", onOff(cfg.automodAntiInvite)),
              kv("Link", onOff(cfg.automodAntiLink)),
              kv("Spam", onOff(cfg.automodAntiSpam)),
              kv("Küfür", onOff(cfg.automodAntiBadwords)),
              kv("Mention", cfg.automodMaxMentions === 0 ? code("kapalı") : code(cfg.automodMaxMentions)),
              kv("Yasak kelime", code(cfg.automodBadwords.length)),
              kv("Muaf kanal", code(cfg.automodIgnoreChannels.length)),
              line(),
              "Mod/Admin muaf · işlemler modlog’a düşer",
            ].join("\n")
          ),
      ],
    });
  }
}
