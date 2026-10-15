import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line } from "../../utils/embeds.js";

const JOKES = [
  "Programcı duşta şampuan şişesine bakar: 'Yıka, durula, tekrarla.' Saatlerce orada kalır.",
  "Neden bilgisayarlar soğuk yerleri sever? Windows açık kalmasın diye.",
  "Bir byte diğerine: 'Sen bit misin?' 'Evet, biraz bitkinim.'",
  "CSS ile tanıştım, hemen border'ımız oldu.",
  "Git commit -m 'fix' — neyi düzelttim bilmiyorum ama çalışıyor.",
];

export default class JokeCommand extends Command {
  constructor() {
    super({
      name: "joke",
      description: "Rastgele şaka",
      category: "fun",
      cooldown: 3,
      data: new SlashCommandBuilder().setName("joke").setDescription("Rastgele şaka").toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const joke = JOKES[Math.floor(Math.random() * JOKES.length)]!;
    const embed = baseEmbed(Theme.fun)
      .setAuthor({ name: "JOKE" })
      .setDescription([line(), joke, line()].join("\n"));
    await interaction.reply({ embeds: [embed] });
  }
}
