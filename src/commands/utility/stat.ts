import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, kv, code, bar } from "../../utils/embeds.js";

export default class StatCommand extends Command {
  constructor() {
    super({
      name: "stat",
      description: "Üye aktivite istatistiği",
      category: "utility",
      cooldown: 5,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("stat")
        .setDescription("Üye aktivite istatistiği")
        .addUserOption((o) =>
          o.setName("kullanici").setDescription("Hedef").setRequired(false)
        )
        .addStringOption((o) =>
          o
            .setName("liste")
            .setDescription("Sıralama")
            .setRequired(false)
            .addChoices(
              { name: "Mesaj top", value: "messages" },
              { name: "Ses top", value: "voice" }
            )
        )
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const liste = interaction.options.getString("liste");

    if (liste === "messages" || liste === "voice") {
      const top =
        liste === "messages"
          ? client.stats.topMessages(interaction.guild.id, 10)
          : client.stats.topVoice(interaction.guild.id, 10);

      if (!top.length) {
        await interaction.reply({
          embeds: [baseEmbed(Theme.mute).setDescription("Henüz veri yok.")],
        });
        return;
      }

      const rows = await Promise.all(
        top.map(async (s, i) => {
          const u = await client.users.fetch(s.userId).catch(() => null);
          const val =
            liste === "messages"
              ? code(`${s.messages} mesaj`)
              : code(`${s.voiceMinutes} dk`);
          return `**${i + 1}.** ${u?.username ?? s.userId} — ${val}`;
        })
      );

      await interaction.reply({
        embeds: [
          baseEmbed(Theme.primary)
            .setAuthor({ name: liste === "messages" ? "STAT · MESAJ" : "STAT · SES" })
            .setDescription([line(), rows.join("\n"), line()].join("\n")),
        ],
      });
      return;
    }

    const user = interaction.options.getUser("kullanici") ?? interaction.user;
    const st = client.stats.get(interaction.guild.id, user.id);
    const eco = client.economy.get(interaction.guild.id, user.id);
    const inv = client.invites.get(interaction.guild.id, user.id);
    const aura = client.aura.get(interaction.guild.id, user.id);
    const needed = eco.level * 100;
    const progress = needed > 0 ? Math.min(1, eco.xp / needed) : 0;

    const embed = baseEmbed(Theme.primary)
      .setAuthor({
        name: user.tag,
        iconURL: user.displayAvatarURL({ size: 64 }),
      })
      .setTitle("İstatistik")
      .setThumbnail(user.displayAvatarURL({ size: 256 }))
      .setDescription(
        [
          line(),
          kv("Mesaj", code(st.messages)),
          kv("Ses", code(`${st.voiceMinutes} dk`)),
          kv("Seviye", `**${eco.level}** · ${code(`${eco.xp}/${needed}`)}`),
          bar(progress),
          kv("Aura", code(aura)),
          kv("Davet (net)", code(inv.joins - inv.left)),
          kv("Cüzdan", code(eco.wallet)),
          line(),
        ].join("\n")
      )
      .setFooter({ text: "Yuta" });

    await interaction.reply({ embeds: [embed] });
  }
}
