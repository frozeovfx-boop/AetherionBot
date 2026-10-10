import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  TextChannel,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

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
        .addStringOption((opt) =>
          opt.setName("odul").setDescription("Ödül").setRequired(true)
        )
        .addStringOption((opt) =>
          opt.setName("sure").setDescription("Süre (örnek: 1h, 30m, 1d)").setRequired(true)
        )
        .addIntegerOption((opt) =>
          opt.setName("kazanan").setDescription("Kazanan sayısı").setRequired(false).setMinValue(1).setMaxValue(20)
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
        content: "Geçersiz süre. Örnek: `30m`, `2h`, `1d` (min 10s, max 30 gün)",
        ephemeral: true,
      });
      return;
    }

    const endsAt = Date.now() + ms;

    const embed = new EmbedBuilder()
      .setColor(0xfee75c)
      .setTitle("🎉 Çekiliş")
      .setDescription(
        `**Ödül:** ${prize}\n**Kazanan:** ${winners} kişi\n**Bitiş:** <t:${Math.floor(endsAt / 1000)}:R>\n\nKatılmak için 🎉 emoji'sine tıkla!`
      )
      .setFooter({ text: `Başlatan: ${interaction.user.tag}` })
      .setTimestamp(endsAt);

    await interaction.reply({ content: "Çekiliş başlatıldı.", ephemeral: true });

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
          await msg.reply("Çekilişe kimse katılmadı.");
          return;
        }

        const selected: string[] = [];
        const pool = [...entrants];
        for (let i = 0; i < Math.min(winners, pool.length); i++) {
          const idx = Math.floor(Math.random() * pool.length);
          selected.push(pool.splice(idx, 1)[0]!.toString());
        }

        const result = new EmbedBuilder()
          .setColor(0x57f287)
          .setTitle("🎉 Çekiliş Bitti")
          .setDescription(`**Ödül:** ${prize}\n**Kazananlar:** ${selected.join(", ")}`)
          .setTimestamp();

        await msg.reply({ embeds: [result] });
      } catch (error) {
        client.logger.error(error, "Giveaway end error");
      }
    }, ms);
  }
}
