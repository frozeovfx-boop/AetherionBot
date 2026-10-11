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

export default class ServerbannerCommand extends Command {
  constructor() {
    super({
      name: "serverbanner",
      description: "Sunucu bannerı",
      category: "utility",
      cooldown: 3,
      guildOnly: true,
      data: new SlashCommandBuilder().setName("serverbanner").setDescription("Sunucu bannerı").toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const g = interaction.guild!;
    const banner = g.bannerURL({ size: 4096 });
    if (!banner) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.mute).setDescription("Sunucu bannerı yok.")],
        ephemeral: true,
      });
      return;
    }

    const embed = baseEmbed(Theme.primary)
      .setAuthor({ name: g.name })
      .setTitle("Banner")
      .setImage(banner)
      .setDescription([line(), g.id, line()].join("\n"));

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setLabel("Aç").setStyle(ButtonStyle.Link).setURL(banner)
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
}
