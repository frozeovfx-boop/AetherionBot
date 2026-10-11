import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  TextChannel,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, kv } from "../../utils/embeds.js";

export default class FirstmessageCommand extends Command {
  constructor() {
    super({
      name: "firstmessage",
      description: "Kanalın ilk mesajını bulur",
      category: "utility",
      cooldown: 10,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("firstmessage")
        .setDescription("Kanalın ilk mesajını bulur")
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.channel || !("messages" in interaction.channel)) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.warning).setDescription("Bu kanalda çalışmaz.")],
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply();
    const channel = interaction.channel as TextChannel;

    try {
      const messages = await channel.messages.fetch({ after: "0", limit: 1 });
      const first = messages.first();
      if (!first) {
        await interaction.editReply({
          embeds: [baseEmbed(Theme.mute).setDescription("Mesaj bulunamadı.")],
        });
        return;
      }

      const embed = baseEmbed(Theme.primary)
        .setAuthor({
          name: first.author.tag,
          iconURL: first.author.displayAvatarURL({ size: 64 }),
        })
        .setTitle("İlk Mesaj")
        .setDescription(
          [
            line(),
            first.content?.slice(0, 800) || "*içerik yok*",
            line(),
            kv("Zaman", `<t:${Math.floor(first.createdTimestamp / 1000)}:F>`),
            line(),
          ].join("\n")
        );

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setLabel("Git").setStyle(ButtonStyle.Link).setURL(first.url)
      );

      await interaction.editReply({ embeds: [embed], components: [row] });
    } catch {
      await interaction.editReply({
        embeds: [baseEmbed(Theme.danger).setDescription("Mesaj alınamadı.")],
      });
    }
  }
}
