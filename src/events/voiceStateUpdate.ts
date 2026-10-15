import {
  Events,
  VoiceState,
  Collection,
  ChannelType,
  PermissionFlagsBits,
} from "discord.js";
import { Event } from "../structures/Event.js";
import type { AetherionClient } from "../client/AetherionClient.js";
import { sendGuildLog } from "../utils/guildLog.js";
import { Theme, baseEmbed, line, kv } from "../utils/embeds.js";

/** guildId:userId -> join timestamp (XP) */
const voiceJoined = new Collection<string, number>();
/** channelId -> ownerId for temp rooms */
const tempRooms = new Collection<string, string>();

const XP_PER_MINUTE = 5;
const COIN_PER_MINUTE = 2;
const MIN_MS = 60_000;

export default class VoiceStateUpdateEvent extends Event<typeof Events.VoiceStateUpdate> {
  constructor() {
    super(Events.VoiceStateUpdate);
  }

  public async execute(
    client: AetherionClient,
    oldState: VoiceState,
    newState: VoiceState
  ): Promise<void> {
    const member = newState.member ?? oldState.member;
    if (!member || member.user.bot) return;
    const guild = newState.guild;
    if (!guild) return;

    // ── Voice log ──
    await logVoice(client, oldState, newState, member).catch(() => null);

    // ── Temp voice (özel oda) ──
    await handleTempVoice(client, oldState, newState).catch((err) =>
      client.logger.error(err, "temp voice")
    );

    // ── Voice XP ──
    const key = `${guild.id}:${member.id}`;
    const joinedChannel = !oldState.channelId && !!newState.channelId;
    const leftChannel = !!oldState.channelId && !newState.channelId;
    const switched =
      !!oldState.channelId &&
      !!newState.channelId &&
      oldState.channelId !== newState.channelId;

    if (joinedChannel) {
      voiceJoined.set(key, Date.now());
      return;
    }

    if (leftChannel || switched) {
      const start = voiceJoined.get(key);
      voiceJoined.delete(key);
      if (switched) voiceJoined.set(key, Date.now());

      if (!start) return;
      const elapsed = Date.now() - start;
      if (elapsed < MIN_MS) return;

      const minutes = Math.floor(elapsed / 60_000);
      if (minutes < 1) return;

      const { leveledUp, profile } = client.economy.addXp(
        guild.id,
        member.id,
        minutes * XP_PER_MINUTE
      );
      client.economy.addWallet(guild.id, member.id, minutes * COIN_PER_MINUTE);

      if (leveledUp) {
        try {
          const ch = guild.systemChannel ?? newState.channel ?? oldState.channel;
          if (ch && ch.isTextBased()) {
            const { Theme, baseEmbed, line, kv } = await import("../utils/embeds.js");
            await ch.send({
              embeds: [
                baseEmbed(Theme.economy)
                  .setAuthor({ name: "LEVEL UP" })
                  .setDescription(
                    [
                      line(),
                      `✦ **${member.user.username}** ses ile yükseldi!`,
                      kv("Seviye", `**${profile.level}**`),
                      line(),
                    ].join("\n")
                  ),
              ],
            });
          }
        } catch {
          /* ignore */
        }
      }
    }
  }
}

async function handleTempVoice(
  client: AetherionClient,
  oldState: VoiceState,
  newState: VoiceState
): Promise<void> {
  const member = newState.member ?? oldState.member;
  if (!member || member.user.bot) return;
  const guild = newState.guild;
  const cfg = client.settings.get(guild.id);
  if (!cfg.tempVoiceHubId) return;

  // Join hub → create private room
  if (newState.channelId === cfg.tempVoiceHubId) {
    const name = `🔊 ${member.displayName}`.slice(0, 100);
    const channel = await guild.channels.create({
      name,
      type: ChannelType.GuildVoice,
      parent: cfg.tempVoiceCategoryId ?? newState.channel?.parentId ?? undefined,
      permissionOverwrites: [
        {
          id: guild.id,
          allow: [PermissionFlagsBits.Connect, PermissionFlagsBits.ViewChannel],
        },
        {
          id: member.id,
          allow: [
            PermissionFlagsBits.Connect,
            PermissionFlagsBits.ManageChannels,
            PermissionFlagsBits.MuteMembers,
            PermissionFlagsBits.MoveMembers,
            PermissionFlagsBits.ViewChannel,
          ],
        },
      ],
      reason: `Özel oda · ${member.user.tag}`,
    });
    tempRooms.set(channel.id, member.id);
    await member.voice.setChannel(channel.id).catch(() => null);
    return;
  }

  // Empty temp room → delete
  if (oldState.channelId && tempRooms.has(oldState.channelId)) {
    const ch = oldState.channel;
    if (ch && ch.members.filter((m) => !m.user.bot).size === 0) {
      tempRooms.delete(oldState.channelId);
      await ch.delete("Özel oda boş").catch(() => null);
    }
  }
}

async function logVoice(
  client: AetherionClient,
  oldState: VoiceState,
  newState: VoiceState,
  member: NonNullable<VoiceState["member"]>
): Promise<void> {
  const guild = newState.guild;
  const cfg = client.settings.get(guild.id);
  if (!cfg.voiceLogChannelId) return;

  const joined = !oldState.channelId && newState.channelId;
  const left = oldState.channelId && !newState.channelId;
  const moved =
    oldState.channelId &&
    newState.channelId &&
    oldState.channelId !== newState.channelId;

  if (!joined && !left && !moved) return;

  let title = "SES";
  let color = Theme.info;
  const rows = [line(), kv("Kullanıcı", member.user.tag)];

  if (joined) {
    title = "SES · GİRİŞ";
    color = Theme.success;
    rows.push(kv("Kanal", `${newState.channel}`));
  } else if (left) {
    title = "SES · ÇIKIŞ";
    color = Theme.mute;
    rows.push(kv("Kanal", `${oldState.channel}`));
  } else if (moved) {
    title = "SES · TAŞINDI";
    color = Theme.info;
    rows.push(kv("Eski", `${oldState.channel}`));
    rows.push(kv("Yeni", `${newState.channel}`));
  }
  rows.push(line());

  const embed = baseEmbed(color)
    .setAuthor({ name: title, iconURL: member.user.displayAvatarURL({ size: 64 }) })
    .setDescription(rows.join("\n"));

  await sendGuildLog(client, guild.id, "voice", embed);
}
