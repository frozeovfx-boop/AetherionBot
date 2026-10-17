import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";
import { FREE_LIMITS, premiumStatusDescription } from "../../utils/premium.js";

export default class PremiumCommand extends Command {
  constructor() {
    super({
      name: "premium",
      description: "Premium durum ve limitler",
      category: "utility",
      cooldown: 5,
      data: new SlashCommandBuilder()
        .setName("premium")
        .setDescription("Premium durum ve limitler")
        .addSubcommand((s) => s.setName("durum").setDescription("Bu sunucunun premium durumu"))
        .addSubcommand((s) =>
          s
            .setName("ver")
            .setDescription("Premium ver (bot sahibi)")
            .addIntegerOption((o) =>
              o
                .setName("gun")
                .setDescription("Kaç gün")
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(3650)
            )
        )
        .addSubcommand((s) =>
          s.setName("al").setDescription("Premium kaldır (bot sahibi)")
        )
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const sub = interaction.options.getSubcommand();

    if (sub === "ver" || sub === "al") {
      if (!client.config.ownerIds.includes(interaction.user.id)) {
        await interaction.reply({ content: "Sadece bot sahibi.", ephemeral: true });
        return;
      }
      if (!interaction.guild) {
        await interaction.reply({ content: "Sunucuda kullan.", ephemeral: true });
        return;
      }
      if (sub === "al") {
        client.settings.setPremium(interaction.guild.id, 0);
        await interaction.reply({
          embeds: [
            baseEmbed(Theme.mute)
              .setAuthor({ name: "PREMIUM" })
              .setDescription("Premium kaldırıldı."),
          ],
        });
        return;
      }
      const gun = interaction.options.getInteger("gun", true);
      const until = Date.now() + gun * 86_400_000;
      client.settings.setPremium(interaction.guild.id, until);
      await interaction.reply({
        embeds: [
          baseEmbed(Theme.success)
            .setAuthor({ name: "PREMIUM" })
            .setDescription(
              [line(), kv("Süre", code(`${gun} gün`)), kv("Bitiş", `<t:${Math.floor(until / 1000)}:F>`), line()].join(
                "\n"
              )
            ),
        ],
      });
      return;
    }

    // durum
    if (!interaction.guild) {
      await interaction.reply({
        embeds: [
          baseEmbed(Theme.primary)
            .setAuthor({ name: "PREMIUM" })
            .setDescription("Premium sunucu bazlıdır. Bir sunucuda `/premium durum` kullan."),
        ],
        ephemeral: true,
      });
      return;
    }

    await interaction.reply({
      embeds: [
        baseEmbed(Theme.primary)
          .setAuthor({ name: "PREMIUM" })
          .setTitle(interaction.guild.name)
          .setDescription(premiumStatusDescription(client, interaction.guild.id)),
      ],
      ephemeral: true,
    });
  }
}
