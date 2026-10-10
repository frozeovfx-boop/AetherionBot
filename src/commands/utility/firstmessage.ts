import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  TextChannel,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class FirstmessageCommand extends Command {
  constructor() {
    super({
      name: "firstmessage",
      description: "Kanaldaki ilk mesajı bulur",
      category: "utility",
      cooldown: 10,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("firstmessage")
        .setDescription("Kanaldaki ilk mesajı bulur")
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.channel || !("messages" in interaction.channel)) {
      await interaction.reply({ content: "Bu kanalda kullanılamaz.", ephemeral: true });
      return;
    }
    await interaction.deferReply();
    const channel = interaction.channel as TextChannel;
    const messages = await channel.messages.fetch({ after: "0", limit: 1 });
    const first = messages.first();
    if (!first) {
      await interaction.editReply({ content: "Mesaj bulunamadı." });
      return;
    }
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("İlk Mesaj")
      .setDescription(first.content?.slice(0, 500) || "*içerik yok*")
      .addFields(
        { name: "Yazan", value: first.author.tag, inline: true },
        { name: "Tarih", value: `<t:${Math.floor(first.createdTimestamp / 1000)}:F>`, inline: true },
        { name: "Link", value: `[Git](${first.url})` }
      )
      .setTimestamp();
    await interaction.editReply({ embeds: [embed] });
  }
}
