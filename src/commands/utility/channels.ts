import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ChannelType,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

export default class ChannelsCommand extends Command {
  constructor() {
    super({
      name: "channels",
      description: "Kanal sayıları",
      category: "utility",
      cooldown: 5,
      guildOnly: true,
      data: new SlashCommandBuilder().setName("channels").setDescription("Kanal sayıları").toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const g = interaction.guild!;
    const text = g.channels.cache.filter((c) => c.type === ChannelType.GuildText).size;
    const voice = g.channels.cache.filter((c) => c.type === ChannelType.GuildVoice).size;
    const cat = g.channels.cache.filter((c) => c.type === ChannelType.GuildCategory).size;
    const stage = g.channels.cache.filter((c) => c.type === ChannelType.GuildStageVoice).size;
    const forum = g.channels.cache.filter((c) => c.type === ChannelType.GuildForum).size;

    const embed = baseEmbed(Theme.primary)
      .setAuthor({ name: g.name, iconURL: g.iconURL({ size: 64 }) ?? undefined })
      .setTitle("Kanallar")
      .setDescription(
        [
          line(),
          kv("Metin", code(text)),
          kv("Ses", code(voice)),
          kv("Kategori", code(cat)),
          kv("Sahne", code(stage)),
          kv("Forum", code(forum)),
          kv("Toplam", code(g.channels.cache.size)),
          line(),
        ].join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
}
