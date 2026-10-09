import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class UserInfoCommand extends Command {
  constructor() {
    super({
      name: "userinfo",
      description: "Kullanıcı bilgilerini gösterir",
      category: "utility",
      cooldown: 5,
      data: new SlashCommandBuilder()
        .setName("userinfo")
        .setDescription("Kullanıcı bilgilerini gösterir")
        .addUserOption((opt) =>
          opt.setName("kullanici").setDescription("Bilgisi alınacak kullanıcı").setRequired(false)
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser("kullanici") ?? interaction.user;
    const member = interaction.guild
      ? await interaction.guild.members.fetch(user.id).catch(() => null)
      : null;

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(user.tag)
      .setThumbnail(user.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: "ID", value: `\`${user.id}\``, inline: true },
        { name: "Bot", value: user.bot ? "Evet" : "Hayır", inline: true },
        { name: "Hesap Oluşturma", value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true }
      )
      .setTimestamp();

    if (member) {
      embed.addFields(
        { name: "Sunucuya Katılma", value: member.joinedTimestamp ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : "Bilinmiyor", inline: true },
        { name: "Takma Ad", value: member.nickname ?? "Yok", inline: true },
        {
          name: "Roller",
          value: member.roles.cache
            .filter((r) => r.id !== interaction.guild!.id)
            .sort((a, b) => b.position - a.position)
            .map((r) => r.toString())
            .slice(0, 15)
            .join(", ") || "Yok",
        }
      );
    }

    await interaction.reply({ embeds: [embed] });
  }
}
