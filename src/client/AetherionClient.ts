import {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
} from "discord.js";
import type { Command } from "../structures/Command.js";
import { logger } from "../utils/logger.js";
import { config } from "../config/index.js";
import { CaseManager } from "../database/CaseManager.js";
import { EconomyManager } from "../database/EconomyManager.js";
import { GuildSettings } from "../database/GuildSettings.js";
import { InventoryManager } from "../database/InventoryManager.js";
import { MusicManager } from "../music/MusicManager.js";
import { SeenManager } from "../database/SeenManager.js";
import { CapsuleManager } from "../database/CapsuleManager.js";
import { AuraManager } from "../database/AuraManager.js";
import { BirthdayManager } from "../database/BirthdayManager.js";
import { InviteManager } from "../database/InviteManager.js";

export class AetherionClient extends Client {
  public commands = new Collection<string, Command>();
  public cooldowns = new Collection<string, Collection<string, number>>();
  public readonly config = config;
  public readonly logger = logger;
  public readonly cases = new CaseManager();
  public readonly economy = new EconomyManager();
  public readonly inventory = new InventoryManager();
  public readonly settings = new GuildSettings();
  public readonly music = new MusicManager();
  public readonly seen = new SeenManager();
  public readonly capsules = new CapsuleManager();
  public readonly aura = new AuraManager();
  public readonly birthdays = new BirthdayManager();
  public readonly invites = new InviteManager();

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
