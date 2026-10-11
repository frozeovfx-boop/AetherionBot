import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, kv } from "../../utils/embeds.js";

export default class CleanCommand extends Command {
  constructor() {
    super({
      name: "clean",
      description: "Bot mesajlarını temizler",
      category: "moderation",
      cooldown: 10,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageMessages],
      clientPermissions: [PermissionFlagsBits.ManageMessages],
      data: new SlashCommandBuilder()
        .setName("clean")
        .setDescription("Bot mesajlarını temizler")
        .addIntegerOption((o) =>
          o.setName("miktar").setDescription("Kontrol miktarı").setMinValue(1).setMaxValue(100).setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.channel || !("messages" in interaction.channel)) return;
    const limit = interaction.options.getInteger("miktar") ?? 50;
    await interaction.deferReply({ ephemeral: true });

    const channel = interaction.channel as TextChannel;
    const messages = await channel.messages.fetch({ limit });
    const botMsgs = messages.filter((m) => m.author.id === client.user!.id || m.author.bot);

    if (botMsgs.size === 0) {
      await interaction.editReply({
        embeds: [baseEmbed(Theme.mute).setDescription("Silinecek bot mesajı yok.")],
      });
      return;
    }

    const deleted = await channel.bulkDelete(botMsgs, true);

    const embed = baseEmbed(Theme.info)
      .setAuthor({ name: "MODERASYON" })
      .setTitle("Clean")
      .setDescription([line(), kv("Silinen", `**${deleted.size}** bot mesajı`), line()].join("\n"));

    await interaction.editReply({ embeds: [embed] });
  }
}
