import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

const FACTS = [
  "Balıklar susuz kalınca susarlar ama ağlayamazlar.",
  "Bir ahtapotun üç kalbi vardır.",
  "Bal ballı değildir — arılar nektarı işler.",
  "Discord 2015'te kuruldu.",
  "İnsan vücudunda yaklaşık 37 trilyon hücre vardır.",
  "Venüs, Güneş Sistemi'ndeki en sıcak gezegendir.",
  "Balinalar uyurken bir beyin yarımküresi uyanık kalır.",
  "Dünyadaki en uzun nehir Nil'dir (tartışmalı: Amazon).",
  "Bir günde Google'da 8 milyar+ arama yapılır.",
  "Kangurular geri geri yürüyemez.",
];

export default class FactCommand extends Command {
  constructor() {
    super({
      name: "fact",
      description: "Rastgele ilginç bilgi",
      category: "fun",
      cooldown: 3,
      data: new SlashCommandBuilder()
        .setName("fact")
        .setDescription("Rastgele ilginç bilgi")
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const fact = FACTS[Math.floor(Math.random() * FACTS.length)]!;
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("📚 Fact")
      .setDescription(fact)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
}
