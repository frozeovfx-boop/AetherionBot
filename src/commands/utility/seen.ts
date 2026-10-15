import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

export default class SeenCommand extends Command {
  constructor() {
    super({
      name: "seen",
      description: "Son görülme zamanı",
      category: "utility",
      cooldown: 3,
      data: new SlashCommandBuilder()
        .setName("seen")
        .setDescription("Son görülme zamanı")
        .addUserOption((o) => o.setName("kullanici").setDescription("Hedef").setRequired(false))
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser("kullanici") ?? interaction.user;
    const ts = client.seen.get(user.id);

    const embed = baseEmbed(Theme.primary)
      .setAuthor({ name: "SEEN" })
      .setThumbnail(user.displayAvatarURL({ size: 256 }))
      .setDescription(
        [
          line(),
          kv("Kullanıcı", user.tag),
          kv(
            "Son aktif",
            ts ? `<t:${Math.floor(ts / 1000)}:R>` : code("kayıt yok")
          ),
          line(),
        ].join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
}
