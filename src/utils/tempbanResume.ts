import type { YutaClient } from "../client/YutaClient.js";

export async function liftTempban(
  client: YutaClient,
  guildId: string,
  userId: string,
  reason = "Tempban süresi doldu"
): Promise<void> {
  try {
    const guild = await client.guilds.fetch(guildId).catch(() => null);
    if (!guild) return;
    await guild.members.unban(userId, reason).catch(() => null);
    client.tempbans.remove(guildId, userId);
    client.logger.info(`Tempban lifted ${guildId}/${userId}`);
  } catch (err) {
    client.logger.error(err, "liftTempban");
  }
}

export function resumeTempbans(client: YutaClient): void {
  for (const e of client.tempbans.all()) {
    const key = `${e.guildId}:${e.userId}`;
    const delay = e.expiresAt - Date.now();
    if (delay <= 0) {
      void liftTempban(client, e.guildId, e.userId);
    } else {
      client.tempbans.schedule(key, delay, () => {
        void liftTempban(client, e.guildId, e.userId);
      });
    }
  }
  client.logger.info(`Tempbans resumed: ${client.tempbans.all().length}`);
}
