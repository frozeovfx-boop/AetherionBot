import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, kv } from "../../utils/embeds.js";
import { snipeCache } from "../../utils/snipe.js";

export default class SnipeCommand extends Command {
  constructor() {
    super({
      name: "snipe",
      description: "Son silinen mesajı gösterir",
      category: "utility",
      cooldown: 5,
      guildOnly: true,
      data: new SlashCommandBuilder().setName("snipe").setDescription("Son silinen mesajı gösterir").toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.channelId) return;
    const sniped = snipeCache.get(interaction.channelId);

    if (!sniped) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.mute).setDescription("Silinen mesaj yok.")],
        ephemeral: true,
      });
      return;
    }

    const embed = baseEmbed(Theme.primary)
      .setAuthor({ name: sniped.authorTag, iconURL: sniped.authorAvatar || undefined })
      .setTitle("Snipe")
      .setDescription(
        [
          line(),
          sniped.content?.slice(0, 1000) || "*içerik yok*",
          line(),
          kv("Zaman", `<t:${Math.floor(sniped.createdAt.getTime() / 1000)}:R>`),
          line(),
        ].join("\n")
      );

    if (sniped.attachments[0]) embed.setImage(sniped.attachments[0]);

    await interaction.reply({ embeds: [embed] });
  }
}
