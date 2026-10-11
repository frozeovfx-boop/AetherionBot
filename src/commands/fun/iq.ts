import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, bar } from "../../utils/embeds.js";

export default class IqCommand extends Command {
  constructor() {
    super({
      name: "iq",
      description: "IQ ölçer (eğlence)",
      category: "fun",
      cooldown: 3,
      data: new SlashCommandBuilder()
        .setName("iq")
        .setDescription("IQ ölçer (eğlence)")
        .addUserOption((o) => o.setName("kullanici").setDescription("Hedef").setRequired(false))
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser("kullanici") ?? interaction.user;
    const iq = 60 + Number(BigInt(user.id) % 101n);

    const embed = baseEmbed(Theme.fun)
      .setAuthor({ name: "IQ" })
      .setTitle(user.username)
      .setDescription(
        [
          line(),
          `**${iq}**`,
          bar(Math.min(1, (iq - 60) / 100)),
          line(),
        ].join("\n")
      )
      .setThumbnail(user.displayAvatarURL({ size: 256 }));

    await interaction.reply({ embeds: [embed] });
  }
}
