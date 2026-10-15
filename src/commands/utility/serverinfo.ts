import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ChannelType,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

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

  public async execute(_client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const g = interaction.guild;
    if (!g) return;

    const text = g.channels.cache.filter((c) => c.type === ChannelType.GuildText).size;
    const voice = g.channels.cache.filter((c) => c.type === ChannelType.GuildVoice).size;
    const boost = g.premiumSubscriptionCount ?? 0;

    const embed = baseEmbed(Theme.primary)
      .setAuthor({ name: "SERVER", iconURL: g.iconURL({ size: 64 }) ?? undefined })
      .setTitle(g.name)
      .setThumbnail(g.iconURL({ size: 256 }))
      .setDescription(
        [
          line(),
          kv("ID", code(g.id)),
          kv("Sahip", `<@${g.ownerId}>`),
          kv("Üye", code(g.memberCount)),
          kv("Kanal", code(`${text} metin · ${voice} ses`)),
          kv("Rol", code(g.roles.cache.size)),
          kv("Boost", code(boost)),
          kv("Oluşturulma", `<t:${Math.floor(g.createdTimestamp / 1000)}:D>`),
          line(),
        ].join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
}
