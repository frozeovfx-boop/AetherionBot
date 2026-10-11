import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  GuildMember,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

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
        .addStringOption((o) =>
          o.setName("sarki").setDescription("Şarkı adı veya URL").setRequired(true)
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild || !interaction.channel) return;

    const member = interaction.member as GuildMember;
    const voice = member.voice.channel;

    if (!voice) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.warning).setDescription("Önce bir ses kanalına gir.")],
        ephemeral: true,
      });
      return;
    }

    const query = interaction.options.getString("sarki", true);
    const track = {
      title: query.length > 80 ? query.slice(0, 77) + "..." : query,
      url: query.startsWith("http") ? query : `search:${query}`,
      duration: 0,
      requesterId: interaction.user.id,
      requesterTag: interaction.user.tag,
    };

    const queue = client.music.ensureQueue(
      interaction.guild.id,
      voice.id,
      interaction.channel.id
    );
    const isFirst = !queue.current && queue.tracks.length === 0;

    if (isFirst) {
      queue.current = track;
      queue.playing = true;
    } else {
      queue.tracks.push(track);
    }

    const embed = baseEmbed(Theme.music)
      .setAuthor({ name: "MUSIC" })
      .setTitle(isFirst ? "Çalıyor" : "Kuyruğa Eklendi")
      .setDescription(
        [
          line(),
          kv("Parça", track.title),
          kv("Kanal", voice.name),
          kv("Sıra", isFirst ? "Şimdi" : code(`#${queue.tracks.length}`)),
          line(),
          "*Lavalink bağlı değil — kuyruk aktif, ses yok.*",
        ].join("\n")
      )
      .setFooter({ text: `İsteyen · ${interaction.user.tag}` });

    await interaction.reply({ embeds: [embed] });
  }
}
