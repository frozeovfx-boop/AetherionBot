import {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
} from "discord.js";
import type { Command } from "../structures/Command.js";
import { logger } from "../utils/logger.js";
import { config } from "../config/index.js";

export class AetherionClient extends Client {
  public commands = new Collection<string, Command>();
  public cooldowns = new Collection<string, Collection<string, number>>();
  public readonly config = config;
  public readonly logger = logger;

  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
      ],
      partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction,
        Partials.User,
        Partials.GuildMember,
      ],
    });
  }

  public async start(): Promise<void> {
    this.logger.info("Starting Aetherion...");
    await this.login(config.DISCORD_TOKEN);
  }
}
