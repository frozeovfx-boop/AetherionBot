import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

const MONTHS = [
  "", "Oca", "Şub", "Mar", "Nis", "May", "Haz",
  "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara",
];

export default class BirthdayCommand extends Command {
  constructor() {
    super({
      name: "birthday",
      description: "Doğum günü kaydı",
      category: "fun",
      cooldown: 5,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("birthday")
        .setDescription("Doğum günü kaydı")
        .addSubcommand((s) =>
          s
            .setName("ayarla")
            .setDescription("Doğum gününü kaydet")
            .addIntegerOption((o) =>
              o.setName("gun").setDescription("Gün (1-31)").setRequired(true).setMinValue(1).setMaxValue(31)
            )
            .addIntegerOption((o) =>
              o.setName("ay").setDescription("Ay (1-12)").setRequired(true).setMinValue(1).setMaxValue(12)
            )
        )
        .addSubcommand((s) => s.setName("sil").setDescription("Kaydı sil"))
        .addSubcommand((s) =>
          s
            .setName("bak")
            .setDescription("Birinin doğum günü")
            .addUserOption((o) => o.setName("kullanici").setDescription("Hedef").setRequired(false))
        )
        .addSubcommand((s) => s.setName("bugun").setDescription("Bugün kimler"))
        .addSubcommand((s) => s.setName("liste").setDescription("Kayıtlı doğum günleri"))
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const sub = interaction.options.getSubcommand();

    if (sub === "ayarla") {
      const day = interaction.options.getInteger("gun", true);
      const month = interaction.options.getInteger("ay", true);
      client.birthdays.set(interaction.guild.id, interaction.user.id, month, day);

      const embed = baseEmbed(Theme.success)
        .setAuthor({ name: "BIRTHDAY" })
        .setDescription(
          [
            line(),
            kv("Tarih", `**${day} ${MONTHS[month]}**`),
            line(),
            "Bugün olduğunda `/birthday bugun` ile görünür.",
          ].join("\n")
        );
      await interaction.reply({ embeds: [embed] });
      return;
    }

    if (sub === "sil") {
      client.birthdays.remove(interaction.guild.id, interaction.user.id);
      await interaction.reply({
        embeds: [baseEmbed(Theme.mute).setDescription("Doğum günü kaydı silindi.")],
      });
      return;
    }

    if (sub === "bak") {
      const user = interaction.options.getUser("kullanici") ?? interaction.user;
      const b = client.birthdays.get(interaction.guild.id, user.id);
      if (!b) {
        await interaction.reply({
          embeds: [baseEmbed(Theme.mute).setDescription("Kayıt yok.")],
          ephemeral: true,
        });
        return;
      }
      const embed = baseEmbed(Theme.primary)
        .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL({ size: 64 }) })
        .setDescription([line(), kv("Doğum günü", `**${b.day} ${MONTHS[b.month]}**`), line()].join("\n"));
      await interaction.reply({ embeds: [embed] });
      return;
    }

    if (sub === "bugun") {
      const list = client.birthdays.today(interaction.guild.id);
      if (!list.length) {
        await interaction.reply({
          embeds: [baseEmbed(Theme.mute).setDescription("Bugün doğum günü yok.")],
        });
        return;
      }
      const mentions = list.map((b) => `<@${b.userId}>`).join(" ");
      const embed = baseEmbed(Theme.success)
        .setAuthor({ name: "BIRTHDAY · BUGÜN" })
        .setDescription([line(), mentions, line(), "✦ İyi ki doğdun!"].join("\n"));
      await interaction.reply({ embeds: [embed] });
      return;
    }

    // liste
    const all = client.birthdays.list(interaction.guild.id).slice(0, 20);
    if (!all.length) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.mute).setDescription("Henüz kayıt yok. `/birthday ayarla`")],
      });
      return;
    }
    const rows = await Promise.all(
      all.map(async (b) => {
        const u = await client.users.fetch(b.userId).catch(() => null);
        return `${code(`${b.day} ${MONTHS[b.month]}`)} — **${u?.username ?? b.userId}**`;
      })
    );
    const embed = baseEmbed(Theme.primary)
      .setAuthor({ name: "BIRTHDAY · LİSTE" })
      .setDescription([line(), rows.join("\n"), line()].join("\n"));
    await interaction.reply({ embeds: [embed] });
  }
}
