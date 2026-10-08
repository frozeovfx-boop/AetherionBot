import {
  ChatInputCommandInteraction,
  ContextMenuCommandInteraction,
  Message,
  PermissionResolvable,
  ApplicationCommandType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  RESTPostAPIContextMenuApplicationCommandsJSONBody,
} from "discord.js";
import type { AetherionClient } from "../client/AetherionClient.js";

export interface CommandOptions {
  name: string;
  description: string;
  category: string;
  cooldown?: number;
  ownerOnly?: boolean;
  guildOnly?: boolean;
  permissions?: PermissionResolvable[];
  clientPermissions?: PermissionResolvable[];
  slash?: boolean;
  prefix?: boolean;
  contextMenu?: boolean;
  data?: RESTPostAPIChatInputApplicationCommandsJSONBody | RESTPostAPIContextMenuApplicationCommandsJSONBody;
}

export abstract class Command {
  public readonly name: string;
  public readonly description: string;
  public readonly category: string;
  public readonly cooldown: number;
  public readonly ownerOnly: boolean;
  public readonly guildOnly: boolean;
  public readonly permissions: PermissionResolvable[];
  public readonly clientPermissions: PermissionResolvable[];
  public readonly slash: boolean;
  public readonly prefix: boolean;
  public readonly contextMenu: boolean;
  public readonly data?: RESTPostAPIChatInputApplicationCommandsJSONBody | RESTPostAPIContextMenuApplicationCommandsJSONBody;

  constructor(options: CommandOptions) {
    this.name = options.name;
    this.description = options.description;
    this.category = options.category;
    this.cooldown = options.cooldown ?? 3;
    this.ownerOnly = options.ownerOnly ?? false;
    this.guildOnly = options.guildOnly ?? false;
    this.permissions = options.permissions ?? [];
    this.clientPermissions = options.clientPermissions ?? [];
    this.slash = options.slash ?? true;
    this.prefix = options.prefix ?? true;
    this.contextMenu = options.contextMenu ?? false;
    this.data = options.data;
  }

  public abstract execute(
    client: AetherionClient,
    interactionOrMessage: ChatInputCommandInteraction | ContextMenuCommandInteraction | Message,
    args?: string[]
  ): Promise<unknown>;
}
