import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  parseEmoji,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

export default class EmojiCommand extends Command {
  constructor() {
    super({
      name: "emoji",
      description: "Emoji bilgisi",
      category: "utility",
      cooldown: 3,
      data: new SlashCommandBuilder()
        .setName("emoji")
        .setDescription("Emoji bilgisi")
        .addStringOption((o) => o.setName("emoji").setDescription("Emoji").setRequired(true))
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const raw = interaction.options.getString("emoji", true);
    const parsed = parseEmoji(raw);

    if (!parsed?.id) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.warning).setDescription("Özel emoji gerekli.")],
        ephemeral: true,
      });
      return;
    }

    const ext = parsed.animated ? "gif" : "png";
    const url = `https://cdn.discordapp.com/emojis/${parsed.id}.${ext}?size=256`;

    const embed = baseEmbed(Theme.primary)
      .setAuthor({ name: "EMOJI" })
      .setTitle(parsed.name ?? "emoji")
      .setThumbnail(url)
      .setDescription(
        [
          line(),
          kv("ID", code(parsed.id)),
          kv("Animated", parsed.animated ? "Evet" : "Hayır"),
          kv("Link", url),
          line(),
        ].join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
}
