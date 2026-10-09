import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class PollCommand extends Command {
  constructor() {
    super({
      name: "poll",
      description: "Basit anket oluşturur",
      category: "utility",
      cooldown: 10,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageMessages],
      data: new SlashCommandBuilder()
        .setName("poll")
        .setDescription("Basit anket oluşturur")
        .addStringOption((opt) =>
          opt.setName("soru").setDescription("Anket sorusu").setRequired(true)
        )
        .addStringOption((opt) =>
          opt.setName("secenek1").setDescription("1. seçenek").setRequired(true)
        )
        .addStringOption((opt) =>
          opt.setName("secenek2").setDescription("2. seçenek").setRequired(true)
        )
        .addStringOption((opt) =>
          opt.setName("secenek3").setDescription("3. seçenek").setRequired(false)
        )
        .addStringOption((opt) =>
          opt.setName("secenek4").setDescription("4. seçenek").setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const question = interaction.options.getString("soru", true);
    const options = [
      interaction.options.getString("secenek1", true),
      interaction.options.getString("secenek2", true),
      interaction.options.getString("secenek3"),
      interaction.options.getString("secenek4"),
    ].filter(Boolean) as string[];

    const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣"];
    const description = options.map((o, i) => `${emojis[i]} ${o}`).join("\n");

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("📊 Anket")
      .setDescription(`**${question}**\n\n${description}`)
      .setFooter({ text: `Oluşturan: ${interaction.user.tag}` })
      .setTimestamp();

    const msg = await interaction.reply({ embeds: [embed], fetchReply: true });

    for (let i = 0; i < options.length; i++) {
      await msg.react(emojis[i]!);
    }
  }
}
