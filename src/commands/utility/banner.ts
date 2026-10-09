import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class BannerCommand extends Command {
  constructor() {
    super({
      name: "banner",
      description: "Kullanıcının bannerını gösterir",
      category: "utility",
      cooldown: 3,
      data: new SlashCommandBuilder()
        .setName("banner")
        .setDescription("Kullanıcının bannerını gösterir")
        .addUserOption((opt) =>
          opt.setName("kullanici").setDescription("Hedef kullanıcı").setRequired(false)
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser("kullanici") ?? interaction.user;
    const fetched = await client.users.fetch(user.id, { force: true });
    const banner = fetched.bannerURL({ size: 4096 });

    if (!banner) {
      await interaction.reply({ content: "Bu kullanıcının bannerı yok.", ephemeral: true });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`${fetched.tag} Banner`)
      .setImage(banner)
      .setURL(banner)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
