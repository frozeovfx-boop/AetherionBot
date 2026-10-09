import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class VoiceMuteCommand extends Command {
  constructor() {
    super({
      name: "voicemute",
      description: "Kullanıcıyı ses kanalında susturur / susturmayı kaldırır",
      category: "moderation",
      cooldown: 3,
      guildOnly: true,
      permissions: [PermissionFlagsBits.MuteMembers],
      clientPermissions: [PermissionFlagsBits.MuteMembers],
      data: new SlashCommandBuilder()
        .setName("voicemute")
        .setDescription("Kullanıcıyı ses kanalında susturur / susturmayı kaldırır")
        .addUserOption((opt) =>
          opt.setName("kullanici").setDescription("Hedef kullanıcı").setRequired(true)
        )
        .addBooleanOption((opt) =>
          opt.setName("sustur").setDescription("true = sustur, false = kaldır").setRequired(true)
        )
        .addStringOption((opt) =>
          opt.setName("sebep").setDescription("Sebep").setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const target = interaction.options.getUser("kullanici", true);
    const mute = interaction.options.getBoolean("sustur", true);
    const reason = interaction.options.getString("sebep") ?? "Voice mute";

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member) {
      await interaction.reply({ content: "Kullanıcı sunucuda bulunamadı.", ephemeral: true });
      return;
    }

    if (!member.voice.channel) {
      await interaction.reply({ content: "Kullanıcı bir ses kanalında değil.", ephemeral: true });
      return;
    }

    await member.voice.setMute(mute, `${reason} | Yetkili: ${interaction.user.tag}`);

    const embed = new EmbedBuilder()
      .setColor(mute ? 0xfee75c : 0x57f287)
      .setTitle(mute ? "Ses Susturma" : "Ses Susturma Kaldırıldı")
      .addFields(
        { name: "Kullanıcı", value: `${target.tag}`, inline: true },
        { name: "Yetkili", value: interaction.user.tag, inline: true },
        { name: "Sebep", value: reason }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
