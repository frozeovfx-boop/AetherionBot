import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

export default class VoicemuteCommand extends Command {
  constructor() {
    super({
      name: "voicemute",
      description: "Ses sustur / kaldır",
      category: "moderation",
      cooldown: 3,
      guildOnly: true,
      permissions: [PermissionFlagsBits.MuteMembers],
      clientPermissions: [PermissionFlagsBits.MuteMembers],
      data: new SlashCommandBuilder()
        .setName("voicemute")
        .setDescription("Ses sustur / kaldır")
        .addUserOption((o) => o.setName("kullanici").setDescription("Hedef").setRequired(true))
        .addBooleanOption((o) =>
          o.setName("sustur").setDescription("true = sustur, false = aç").setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const target = interaction.options.getUser("kullanici", true);
    const mute = interaction.options.getBoolean("sustur", true);
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);

    if (!member?.voice.channel) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.warning).setDescription("Kullanıcı ses kanalında değil.")],
        ephemeral: true,
      });
      return;
    }

    await member.voice.setMute(mute, `voicemute · ${interaction.user.tag}`);

    const embed = baseEmbed(mute ? Theme.warning : Theme.success)
      .setAuthor({ name: "MODERASYON" })
      .setTitle(mute ? "Ses Susturuldu" : "Ses Açıldı")
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
