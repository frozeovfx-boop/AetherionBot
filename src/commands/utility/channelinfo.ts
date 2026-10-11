import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ChannelType,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

export default class ChannelinfoCommand extends Command {
  constructor() {
    super({
      name: "channelinfo",
      description: "Kanal bilgisi",
      category: "utility",
      cooldown: 3,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("channelinfo")
        .setDescription("Kanal bilgisi")
        .addChannelOption((o) => o.setName("kanal").setDescription("Kanal").setRequired(false))
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const channel = interaction.options.getChannel("kanal") ?? interaction.channel;
    if (!channel) return;

    const typeName = ChannelType[channel.type] ?? String(channel.type);

    const embed = baseEmbed(Theme.primary)
      .setAuthor({ name: "CHANNEL" })
      .setTitle(channel.name ?? "kanal")
      .setDescription(
        [
          line(),
          kv("ID", code(channel.id)),
          kv("Tip", code(typeName)),
          "createdAt" in channel && (channel as { createdTimestamp?: number }).createdTimestamp
            ? kv("Oluşturma", `<t:${Math.floor((channel as { createdTimestamp: number }).createdTimestamp / 1000)}:R>`)
            : null,
          line(),
        ]
          .filter(Boolean)
          .join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
}
