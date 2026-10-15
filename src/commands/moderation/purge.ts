import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, kv } from "../../utils/embeds.js";

export default class PurgeCommand extends Command {
  constructor() {
    super({
      name: "purge",
      description: "Toplu mesaj siler",
      category: "moderation",
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageMessages],
      clientPermissions: [PermissionFlagsBits.ManageMessages],
      data: new SlashCommandBuilder()
        .setName("purge")
        .setDescription("Toplu mesaj siler")
        .addIntegerOption((o) =>
          o.setName("miktar").setDescription("1-100").setRequired(true).setMinValue(1).setMaxValue(100)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.channel || !("bulkDelete" in interaction.channel)) return;

    const amount = interaction.options.getInteger("miktar", true);
    await interaction.deferReply({ ephemeral: true });

    const deleted = await (interaction.channel as TextChannel).bulkDelete(amount, true);

    const embed = baseEmbed(Theme.info)
      .setAuthor({ name: "MODERASYON" })
      .setTitle("Temizlik")
      .setDescription(
        [
          line(),
          kv("Silinen", `**${deleted.size}** mesaj`),
          kv("Kanal", `${interaction.channel}`),
          kv("Yetkili", interaction.user.tag),
          line(),
        ].join("\n")
      );

    await interaction.editReply({ embeds: [embed] });
  }
}
