import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ChannelType,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, code, divider } from "../../utils/embeds.js";

export default class ServerinfoCommand extends Command {
  constructor() {
    super({
      name: "serverinfo",
      description: "Sunucu bilgileri",
      category: "utility",
      cooldown: 5,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("serverinfo")
        .setDescription("Sunucu bilgileri")
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const g = interaction.guild!;
    const owner = await g.fetchOwner().catch(() => null);
    const text = g.channels.cache.filter((c) => c.type === ChannelType.GuildText).size;
    const voice = g.channels.cache.filter((c) => c.type === ChannelType.GuildVoice).size;

    const embed = baseEmbed(Theme.primary)
      .setTitle(`◈  ${g.name}`)
      .setThumbnail(g.iconURL({ size: 256 }) ?? null)
      .setDescription(
        [
          divider(),
          `**ID**          ${code(g.id)}`,
          `**Sahip**       ${owner?.user.tag ?? "—"}`,
          `**Oluşturulma** <t:${Math.floor(g.createdTimestamp / 1000)}:R>`,
          divider(),
          `**Üyeler**      ${code(g.memberCount.toLocaleString())}`,
          `**Roller**      ${code(g.roles.cache.size)}`,
          `**Kanallar**    ${code(text)} metin · ${code(voice)} ses`,
          `**Boost**       ${code(`Seviye ${g.premiumTier}`)} · ${code(g.premiumSubscriptionCount ?? 0)} boost`,
          divider(),
        ].join("\n")
      )
      .setImage(g.bannerURL({ size: 1024 }) ?? null);

    await interaction.reply({ embeds: [embed] });
  }
}
