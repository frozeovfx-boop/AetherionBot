import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line } from "../../utils/embeds.js";

export default class ServericonCommand extends Command {
  constructor() {
    super({
      name: "servericon",
      description: "Sunucu ikonu",
      category: "utility",
      cooldown: 3,
      guildOnly: true,
      data: new SlashCommandBuilder().setName("servericon").setDescription("Sunucu ikonu").toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const g = interaction.guild!;
    const icon = g.iconURL({ size: 4096 });
    if (!icon) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.mute).setDescription("Sunucu ikonu yok.")],
        ephemeral: true,
      });
      return;
    }

    const embed = baseEmbed(Theme.primary)
      .setAuthor({ name: g.name })
      .setTitle("İkon")
      .setImage(icon)
      .setDescription([line(), g.id, line()].join("\n"));

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setLabel("Aç").setStyle(ButtonStyle.Link).setURL(icon)
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
}
