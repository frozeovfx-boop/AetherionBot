import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  TextChannel,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class SuggestionCommand extends Command {
  constructor() {
    super({
      name: "suggestion",
      description: "Öneri gönderir",
      category: "server",
      cooldown: 30,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("suggestion")
        .setDescription("Öneri gönderir")
        .addStringOption((opt) =>
          opt.setName("oneri").setDescription("Önerin").setRequired(true)
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const text = interaction.options.getString("oneri", true);

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setAuthor({
        name: interaction.user.tag,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTitle("💡 Öneri")
      .setDescription(text)
      .setTimestamp();

    await interaction.reply({ content: "Önerin gönderildi.", ephemeral: true });

    if (interaction.channel && "send" in interaction.channel) {
      const msg = await (interaction.channel as TextChannel).send({ embeds: [embed] });
      await msg.react("✅");
      await msg.react("❌");
    }
  }
}
