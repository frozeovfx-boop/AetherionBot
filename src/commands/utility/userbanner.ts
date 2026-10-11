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

export default class UserbannerCommand extends Command {
  constructor() {
    super({
      name: "userbanner",
      description: "Kullanıcı bannerı (büyük)",
      category: "utility",
      cooldown: 3,
      data: new SlashCommandBuilder()
        .setName("userbanner")
        .setDescription("Kullanıcı bannerı (büyük)")
        .addUserOption((o) => o.setName("kullanici").setDescription("Hedef").setRequired(false))
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const user = await client.users.fetch(
      (interaction.options.getUser("kullanici") ?? interaction.user).id,
      { force: true }
    );
    const banner = user.bannerURL({ size: 4096 });
    if (!banner) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.mute).setDescription("Banner yok.")],
        ephemeral: true,
      });
      return;
    }

    const embed = baseEmbed(Theme.primary)
      .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL({ size: 64 }) })
      .setTitle("Banner")
      .setImage(banner)
      .setDescription([line(), user.id, line()].join("\n"));

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setLabel("Aç").setStyle(ButtonStyle.Link).setURL(banner)
    );
    await interaction.reply({ embeds: [embed], components: [row] });
  }
}
