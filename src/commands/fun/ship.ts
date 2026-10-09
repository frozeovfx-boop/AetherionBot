import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class ShipCommand extends Command {
  constructor() {
    super({
      name: "ship",
      description: "İki kullanıcıyı ship'ler",
      category: "fun",
      cooldown: 3,
      data: new SlashCommandBuilder()
        .setName("ship")
        .setDescription("İki kullanıcıyı ship'ler")
        .addUserOption((opt) =>
          opt.setName("kisi1").setDescription("1. kişi").setRequired(true)
        )
        .addUserOption((opt) =>
          opt.setName("kisi2").setDescription("2. kişi").setRequired(true)
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const u1 = interaction.options.getUser("kisi1", true);
    const u2 = interaction.options.getUser("kisi2", true);

    const percent = Number((BigInt(u1.id) + BigInt(u2.id)) % 101n);
    const barFilled = Math.round(percent / 10);
    const bar = "█".repeat(barFilled) + "░".repeat(10 - barFilled);

    let verdict = "Uyum yok...";
    if (percent >= 80) verdict = "Mükemmel uyum!";
    else if (percent >= 60) verdict = "Güzel bir çift olabilirler";
    else if (percent >= 40) verdict = "İdare eder";
    else if (percent >= 20) verdict = "Zor görünüyor";

    const embed = new EmbedBuilder()
      .setColor(0xeb459e)
      .setTitle("💖 Ship")
      .setDescription(
        `**${u1.username}** × **${u2.username}**\n\n` +
          `\`${bar}\` **${percent}%**\n\n${verdict}`
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
