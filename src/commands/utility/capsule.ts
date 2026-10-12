import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

function parseDuration(input: string): number | null {
  const match = input.match(/^(\d+)(m|h|d)$/i);
  if (!match) return null;
  const value = parseInt(match[1]!, 10);
  const unit = match[2]!.toLowerCase();
  const map: Record<string, number> = { m: 60_000, h: 3_600_000, d: 86_400_000 };
  return value * (map[unit] ?? 0);
}

export default class CapsuleCommand extends Command {
  constructor() {
    super({
      name: "capsule",
      description: "Zaman kapsülü — geleceğe mesaj",
      category: "utility",
      cooldown: 10,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("capsule")
        .setDescription("Zaman kapsülü — geleceğe mesaj")
        .addStringOption((o) =>
          o.setName("sure").setDescription("Ne zaman açılsın? (30m, 2h, 7d)").setRequired(true)
        )
        .addStringOption((o) =>
          o.setName("mesaj").setDescription("Mesaj içeriği").setRequired(true)
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild || !interaction.channel) return;

    const durationStr = interaction.options.getString("sure", true);
    const content = interaction.options.getString("mesaj", true);
    const ms = parseDuration(durationStr);

    if (!ms || ms < 60_000 || ms > 90 * 86_400_000) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.warning).setDescription("Süre: `30m` – `90d` arası.")],
        ephemeral: true,
      });
      return;
    }

    const openAt = Date.now() + ms;
    const capsule = client.capsules.create({
      guildId: interaction.guild.id,
      channelId: interaction.channel.id,
      authorId: interaction.user.id,
      authorTag: interaction.user.tag,
      content: content.slice(0, 1900),
      openAt,
    });

    const embed = baseEmbed(Theme.info)
      .setAuthor({ name: "CAPSULE" })
      .setTitle("Kilitlendi")
      .setDescription(
        [
          line(),
          kv("ID", code(capsule.id)),
          kv("Açılış", `<t:${Math.floor(openAt / 1000)}:F>`),
          kv("Kalan", `<t:${Math.floor(openAt / 1000)}:R>`),
          line(),
          "*Mesaj zamanı gelince bu kanala düşecek.*",
        ].join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
}
