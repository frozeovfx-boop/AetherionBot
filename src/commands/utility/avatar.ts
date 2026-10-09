import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class AvatarCommand extends Command {
  constructor() {
    super({
      name: "avatar",
      description: "Kullanıcının avatarını gösterir",
      category: "utility",
      cooldown: 3,
      data: new SlashCommandBuilder()
        .setName("avatar")
        .setDescription("Kullanıcının avatarını gösterir")
        .addUserOption((opt) =>
          opt.setName("kullanici").setDescription("Hedef kullanıcı").setRequired(false)
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser("kullanici") ?? interaction.user;
    const url = user.displayAvatarURL({ size: 4096 });

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`${user.tag} Avatar`)
      .setImage(url)
      .setURL(url)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
