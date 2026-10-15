import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, kv, code, bar } from "../../utils/embeds.js";

export default class AuraCommand extends Command {
  constructor() {
    super({
      name: "aura",
      description: "Aura / rep ver veya bak",
      category: "fun",
      cooldown: 5,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("aura")
        .setDescription("Aura / rep ver veya bak")
        .addSubcommand((s) =>
          s
            .setName("ver")
            .setDescription("Birine +1 aura")
            .addUserOption((o) => o.setName("kullanici").setDescription("Hedef").setRequired(true))
        )
        .addSubcommand((s) =>
          s
            .setName("bak")
            .setDescription("Aura puanı")
            .addUserOption((o) => o.setName("kullanici").setDescription("Hedef").setRequired(false))
        )
        .addSubcommand((s) => s.setName("top").setDescription("Aura sıralaması"))
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const sub = interaction.options.getSubcommand();

    if (sub === "ver") {
      const target = interaction.options.getUser("kullanici", true);
      const result = client.aura.give(interaction.guild.id, interaction.user.id, target.id);

      if (!result.ok) {
        if (result.reason === "self") {
          await interaction.reply({
            embeds: [baseEmbed(Theme.warning).setDescription("Kendine aura veremezsin.")],
            ephemeral: true,
          });
          return;
        }
        const h = Math.ceil((result.remainingMs ?? 0) / 3_600_000);
        await interaction.reply({
          embeds: [
            baseEmbed(Theme.warning).setDescription(
              `Bu kişiye tekrar aura için **~${h} saat** bekle.`
            ),
          ],
          ephemeral: true,
        });
        return;
      }

      const embed = baseEmbed(Theme.primary)
        .setAuthor({ name: "AURA" })
        .setDescription(
          [
            line(),
            `✦ **${interaction.user.username}** → **${target.username}**`,
            kv("Yeni aura", code(result.score)),
            line(),
          ].join("\n")
        )
        .setThumbnail(target.displayAvatarURL({ size: 256 }));

      await interaction.reply({ embeds: [embed] });
      return;
    }

    if (sub === "bak") {
      const user = interaction.options.getUser("kullanici") ?? interaction.user;
      const score = client.aura.get(interaction.guild.id, user.id);
      const max = Math.max(50, score);
      const embed = baseEmbed(Theme.primary)
        .setAuthor({ name: "AURA" })
        .setTitle(user.username)
        .setThumbnail(user.displayAvatarURL({ size: 256 }))
        .setDescription(
          [
            line(),
            `**${score}** aura`,
            bar(Math.min(1, score / max)),
            line(),
          ].join("\n")
        );
      await interaction.reply({ embeds: [embed] });
      return;
    }

    // top
    const top = client.aura.leaderboard(interaction.guild.id, 10);
    if (!top.length) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.mute).setDescription("Henüz aura yok. `/aura ver` ile başla.")],
      });
      return;
    }

    const lines = await Promise.all(
      top.map(async (e, i) => {
        const u = await client.users.fetch(e.userId).catch(() => null);
        return `**${i + 1}.** ${u?.username ?? e.userId} — ${code(e.score)}`;
      })
    );

    const embed = baseEmbed(Theme.primary)
      .setAuthor({ name: "AURA · TOP" })
      .setDescription([line(), lines.join("\n"), line()].join("\n"));

    await interaction.reply({ embeds: [embed] });
  }
}
