import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, bar } from "../../utils/embeds.js";

export default class ShipCommand extends Command {
  constructor() {
    super({
      name: "ship",
      description: "İki kullanıcıyı ship'le",
      category: "fun",
      cooldown: 3,
      data: new SlashCommandBuilder()
        .setName("ship")
        .setDescription("İki kullanıcıyı ship'le")
        .addUserOption((o) => o.setName("bir").setDescription("1. kişi").setRequired(true))
        .addUserOption((o) => o.setName("iki").setDescription("2. kişi").setRequired(false))
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const a = interaction.options.getUser("bir", true);
    const b = interaction.options.getUser("iki") ?? interaction.user;
    const score = Number((BigInt(a.id) + BigInt(b.id)) % 101n);

    let label = "Arkadaşlık";
    if (score >= 90) label = "Kader";
    else if (score >= 70) label = "Güçlü bağ";
    else if (score >= 40) label = "İhtimal var";
    else if (score >= 20) label = "Zor";
    else label = "Uzak";

    const embed = baseEmbed(Theme.fun)
      .setAuthor({ name: "SHIP" })
      .setTitle(`${a.username}  ×  ${b.username}`)
      .setDescription(
        [
          line(),
          `**${score}%**  —  ${label}`,
          bar(score / 100),
          line(),
        ].join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
}
