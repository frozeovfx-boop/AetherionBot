import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  GuildMember,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

export default class DeafenCommand extends Command {
  constructor() {
    super({
      name: "deafen",
      description: "Kullanıcıyı sağırlaştır / kaldır",
      category: "moderation",
      cooldown: 3,
      guildOnly: true,
      permissions: [PermissionFlagsBits.DeafenMembers],
      clientPermissions: [PermissionFlagsBits.DeafenMembers],
      data: new SlashCommandBuilder()
        .setName("deafen")
        .setDescription("Kullanıcıyı sağırlaştır / kaldır")
        .addUserOption((o) => o.setName("kullanici").setDescription("Hedef").setRequired(true))
        .addBooleanOption((o) =>
          o.setName("durum").setDescription("true = sağırlaştır, false = kaldır").setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.DeafenMembers)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const target = interaction.options.getUser("kullanici", true);
    const state = interaction.options.getBoolean("durum", true);
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);

    if (!member?.voice.channel) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.warning).setDescription("Kullanıcı ses kanalında değil.")],
        ephemeral: true,
      });
      return;
    }

    await member.voice.setDeaf(state, `deafen · ${interaction.user.tag}`);

    const embed = baseEmbed(state ? Theme.warning : Theme.success)
      .setAuthor({ name: "MODERASYON" })
      .setTitle(state ? "Sağırlaştırıldı" : "Sağırlaştırma Kaldırıldı")
      .setThumbnail(target.displayAvatarURL({ size: 256 }))
      .setDescription(
        [
          line(),
          kv("Kullanıcı", target.tag),
          kv("ID", code(target.id)),
          kv("Yetkili", interaction.user.tag),
          line(),
        ].join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
}
