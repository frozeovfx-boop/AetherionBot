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

export default class AvatarCommand extends Command {
  constructor() {
    super({
      name: "avatar",
      description: "Kullanıcı avatarını gösterir",
      category: "utility",
      cooldown: 3,
      data: new SlashCommandBuilder()
        .setName("avatar")
        .setDescription("Kullanıcı avatarını gösterir")
        .addUserOption((o) => o.setName("kullanici").setDescription("Hedef").setRequired(false))
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser("kullanici") ?? interaction.user;
    const png = user.displayAvatarURL({ size: 4096, extension: "png" });
    const webp = user.displayAvatarURL({ size: 4096, extension: "webp" });

    const embed = baseEmbed(Theme.primary)
      .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL({ size: 64 }) })
      .setTitle("Avatar")
      .setImage(user.displayAvatarURL({ size: 4096 }))
      .setDescription(`${line()}\n${user.id}\n${line()}`);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setLabel("PNG").setStyle(ButtonStyle.Link).setURL(png),
      new ButtonBuilder().setLabel("WEBP").setStyle(ButtonStyle.Link).setURL(webp)
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
}
