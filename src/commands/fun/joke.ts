import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

const JOKES = [
  "Adamın biri güneşe bakmış, gözleri yanmış. Neden? Çünkü güneş hot.",
  "Temel ile Dursun balığa çıkmış. Temel: 'Balık tuttun mu?' Dursun: 'Hayır, balık beni tuttu.'",
  "Neden bilgisayar soğuk algınlığına yakalanmaz? Çünkü Windows'u açık tutar.",
  "Bir debeciye sormuşlar: 'Neden hep geç kalıyorsun?' 'Çünkü trafik var' demiş. Trafikteymiş.",
  "Doktor hastaya: 'Daha az stres yapın.' Hasta: 'Tamam, sizi daha az arayacağım.'",
  "İki avcı ormanda. Biri düşmüş. Diğeri: 'Ölüsün sen!' Birinci: 'Yalan söylüyorsun, ben buradayım.'",
  "Programcı karısına: 'Süt al, yoksa yumurta da al.' Karısı süt bulmuş, yumurta almamış.",
];

export default class JokeCommand extends Command {
  constructor() {
    super({
      name: "joke",
      description: "Rastgele şaka anlatır",
      category: "fun",
      cooldown: 3,
      data: new SlashCommandBuilder()
        .setName("joke")
        .setDescription("Rastgele şaka anlatır")
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const joke = JOKES[Math.floor(Math.random() * JOKES.length)]!;

    const embed = new EmbedBuilder()
      .setColor(0xfee75c)
      .setTitle("😂 Şaka")
      .setDescription(joke)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
