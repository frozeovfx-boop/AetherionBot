import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line } from "../../utils/embeds.js";

const EMOJIS = ["1️⃣", "2️⃣", "3️⃣", "4️⃣"];

export default class PollCommand extends Command {
  constructor() {
    super({
      name: "poll",
      description: "Anket oluşturur",
      category: "utility",
      cooldown: 10,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageMessages],
      data: new SlashCommandBuilder()
        .setName("poll")
        .setDescription("Anket oluşturur")
        .addStringOption((o) => o.setName("soru").setDescription("Soru").setRequired(true))
        .addStringOption((o) => o.setName("secenek1").setDescription("1. seçenek").setRequired(true))
        .addStringOption((o) => o.setName("secenek2").setDescription("2. seçenek").setRequired(true))
        .addStringOption((o) => o.setName("secenek3").setDescription("3. seçenek").setRequired(false))
        .addStringOption((o) => o.setName("secenek4").setDescription("4. seçenek").setRequired(false))
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

    const body = options.map((o, i) => `${EMOJIS[i]}  **${o}**`).join("\n");

    const embed = baseEmbed(Theme.primary)
      .setAuthor({ name: "POLL", iconURL: interaction.user.displayAvatarURL({ size: 64 }) })
      .setTitle(question.slice(0, 200))
      .setDescription([line(), body, line()].join("\n"))
      .setFooter({ text: `Oluşturan · ${interaction.user.tag}` });

    const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
    for (let i = 0; i < options.length; i++) {
      await msg.react(EMOJIS[i]!);
    }
  }
}
