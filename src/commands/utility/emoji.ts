import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class EmojiCommand extends Command {
  constructor() {
    super({
      name: "emoji",
      description: "Özel emoji bilgisini gösterir",
      category: "utility",
      cooldown: 3,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("emoji")
        .setDescription("Özel emoji bilgisini gösterir")
        .addStringOption((opt) =>
          opt.setName("emoji").setDescription("Emoji").setRequired(true)
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const raw = interaction.options.getString("emoji", true);
    const match = raw.match(/<a?:(\w+):(\d+)>/);
    if (!match) {
      await interaction.reply({ content: "Geçerli bir özel emoji gir.", ephemeral: true });
      return;
    }
    const [, name, id] = match;
    const animated = raw.startsWith("<a:");
    const url = `https://cdn.discordapp.com/emojis/${id}.${animated ? "gif" : "png"}?size=128`;
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`:${name}:`)
      .setThumbnail(url)
      .addFields(
        { name: "ID", value: id!, inline: true },
        { name: "Animasyonlu", value: animated ? "Evet" : "Hayır", inline: true }
      )
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
}
