import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, kv } from "../../utils/embeds.js";

export default class ReportCommand extends Command {
  constructor() {
    super({
      name: "report",
      description: "Kullanıcıyı raporla",
      category: "moderation",
      cooldown: 30,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("report")
        .setDescription("Kullanıcıyı raporla")
        .addUserOption((o) => o.setName("kullanici").setDescription("Hedef").setRequired(true))
        .addStringOption((o) => o.setName("sebep").setDescription("Sebep").setRequired(true))
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser("kullanici", true);
    const reason = interaction.options.getString("sebep", true);

    const embed = baseEmbed(Theme.warning)
      .setAuthor({ name: "REPORT" })
      .setTitle("Rapor Alındı")
      .setDescription(
        [
          line(),
          kv("Hedef", target.tag),
          kv("Raporlayan", interaction.user.tag),
          kv("Sebep", reason.slice(0, 300)),
          line(),
        ].join("\n")
      );

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
}
