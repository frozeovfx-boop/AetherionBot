import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  ChannelType,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class PlayCommand extends Command {
  constructor() {
    super({
      name: "play",
      description: "Müzik çalar / kuyruğa ekler",
      category: "music",
      cooldown: 3,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Müzik çalar / kuyruğa ekler")
        .addStringOption((opt) =>
          opt.setName("sarki").setDescription("Şarkı adı veya URL").setRequired(true)
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const member = interaction.member as GuildMember;
    const voice = member.voice.channel;

    if (!voice || (voice.type !== ChannelType.GuildVoice && voice.type !== ChannelType.GuildStageVoice)) {
      await interaction.reply({ content: "Önce bir ses kanalına gir.", ephemeral: true });
      return;
    }

    const query = interaction.options.getString("sarki", true);

    const queue = client.music.ensureQueue(interaction.guild.id, voice.id, interaction.channelId);

    // Placeholder track until Lavalink is connected
    const track = {
      title: query,
      url: query.startsWith("http") ? query : `search:${query}`,
      duration: 0,
      requesterId: interaction.user.id,
      requesterTag: interaction.user.tag,
    };

    const position = client.music.addTrack(interaction.guild.id, track);

    if (!queue.current) {
      queue.current = queue.tracks.shift() ?? null;
      queue.playing = true;
    }

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(queue.playing && position <= 1 ? "Çalıyor" : "Kuyruğa Eklendi")
      .setDescription(`**${track.title}**\nİsteyen: ${interaction.user.tag}`)
      .setFooter({
        text: "Lavalink bağlandığında gerçek ses çalacak. Şu an kuyruk sistemi aktif.",
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
