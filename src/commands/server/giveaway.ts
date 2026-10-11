import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

function parseDuration(input: string): number | null {
  const match = input.match(/^(\d+)(s|m|h|d)$/i);
  if (!match) return null;
  const value = parseInt(match[1]!, 10);
  const unit = match[2]!.toLowerCase();
  const map: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return value * (map[unit] ?? 0);
}

export default class GiveawayCommand extends Command {
  constructor() {
    super({
      name: "giveaway",
      description: "Çekiliş başlatır",
      category: "server",
      cooldown: 10,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageGuild],
      data: new SlashCommandBuilder()
        .setName("giveaway")
        .setDescription("Çekiliş başlatır")
        .addStringOption((o) => o.setName("odul").setDescription("Ödül").setRequired(true))
        .addStringOption((o) =>
          o.setName("sure").setDescription("Süre (30m, 2h, 1d)").setRequired(true)
        )
        .addIntegerOption((o) =>
          o.setName("kazanan").setDescription("Kazanan sayısı").setMinValue(1).setMaxValue(20).setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild || !interaction.channel) return;

    const prize = interaction.options.getString("odul", true);
    const durationStr = interaction.options.getString("sure", true);
    const winners = interaction.options.getInteger("kazanan") ?? 1;
    const ms = parseDuration(durationStr);

    if (!ms || ms < 10_000 || ms > 30 * 86_400_000) {
      await interaction.reply({
        embeds: [
          baseEmbed(Theme.warning).setDescription("Geçersiz süre. Örnek: `30m` `2h` `1d`"),
        ],
        ephemeral: true,
      });
      return;
    }

    const endsAt = Date.now() + ms;

    const embed = baseEmbed(Theme.economy)
      .setAuthor({ name: "GIVEAWAY" })
      .setTitle("Çekiliş")
      .setDescription(
        [
          line(),
          kv("Ödül", prize),
          kv("Kazanan", `${winners} kişi`),
          kv("Bitiş", `<t:${Math.floor(endsAt / 1000)}:R>`),
          line(),
          "Katılmak için 🎉 tepkisine tıkla.",
        ].join("\n")
      )
      .setFooter({ text: `Başlatan · ${interaction.user.tag}` })
      .setTimestamp(endsAt);

    await interaction.reply({
      embeds: [baseEmbed(Theme.success).setDescription("Çekiliş başlatıldı.")],
      ephemeral: true,
    });

    const channel = interaction.channel as TextChannel;
    const msg = await channel.send({ embeds: [embed] });
    await msg.react("🎉");

    setTimeout(async () => {
      try {
        const fetched = await msg.fetch();
        const reaction = fetched.reactions.cache.get("🎉");
        const users = reaction ? await reaction.users.fetch() : null;
        const entrants = users?.filter((u) => !u.bot).map((u) => u) ?? [];

        if (entrants.length === 0) {
          await msg.reply({
            embeds: [baseEmbed(Theme.mute).setDescription("Kimse katılmadı.")],
          });
          return;
        }

        const selected: string[] = [];
        const pool = [...entrants];
        for (let i = 0; i < Math.min(winners, pool.length); i++) {
          const idx = Math.floor(Math.random() * pool.length);
          selected.push(pool.splice(idx, 1)[0]!.toString());
        }

        await msg.reply({
          embeds: [
            baseEmbed(Theme.success)
              .setAuthor({ name: "GIVEAWAY" })
              .setTitle("Sonuç")
              .setDescription(
                [
                  line(),
                  kv("Ödül", prize),
                  kv("Kazananlar", selected.join(", ")),
                  line(),
                ].join("\n")
              ),
          ],
        });
      } catch (error) {
        client.logger.error(error, "Giveaway end error");
      }
    }, ms);
  }
}
