import {
  Message,
  User,
  GuildMember,
  Guild,
  TextChannel,
  NewsChannel,
  ThreadChannel,
  Role,
  ChannelType,
  Collection,
  MessageFlags,
  type InteractionReplyOptions,
  type InteractionEditReplyOptions,
  type MessageReplyOptions,
} from "discord.js";

type ReplyPayload = InteractionReplyOptions | InteractionEditReplyOptions | MessageReplyOptions;

/**
 * Makes a Message look enough like ChatInputCommandInteraction
 * so existing slash commands can run via prefix.
 *
 * Args are positional in the order of the slash options definition.
 * Mentions: first user mention for getUser, first role for getRole, etc.
 */
export class PrefixInteraction {
  public readonly user: User;
  public readonly member: GuildMember | null;
  public readonly guild: Guild | null;
  public readonly channel: Message["channel"];
  public readonly channelId: string;
  public readonly guildId: string | null;
  public readonly client: Message["client"];
  public readonly commandName: string;
  public readonly createdTimestamp: number;

  public deferred = false;
  public replied = false;
  public ephemeral = false;

  private readonly message: Message;
  private readonly positional: string[];
  private readonly optionNames: string[];
  private deferredMsg: Message | null = null;
  private replyMsg: Message | null = null;

  public readonly options: PrefixOptions;

  constructor(message: Message, commandName: string, args: string[], optionNames: string[] = []) {
    this.message = message;
    this.commandName = commandName;
    this.positional = [...args];
    this.optionNames = optionNames;
    this.user = message.author;
    this.member = message.member;
    this.guild = message.guild;
    this.channel = message.channel;
    this.channelId = message.channel.id;
    this.guildId = message.guild?.id ?? null;
    this.client = message.client;
    this.createdTimestamp = message.createdTimestamp;
    this.options = new PrefixOptions(message, this.positional, optionNames);
  }

  public async reply(options: string | ReplyPayload): Promise<Message> {
    const payload = this.normalize(options);
    if (this.deferred && this.deferredMsg) {
      this.replied = true;
      return this.deferredMsg.edit(payload as MessageReplyOptions);
    }
    this.replied = true;
    this.replyMsg = await this.message.reply(payload as MessageReplyOptions);
    return this.replyMsg;
  }

  public async deferReply(opts?: { ephemeral?: boolean }): Promise<void> {
    this.deferred = true;
    this.ephemeral = opts?.ephemeral ?? false;
    this.deferredMsg = await this.message.reply({ content: "…" });
  }

  public async editReply(options: string | ReplyPayload): Promise<Message> {
    const payload = this.normalize(options);
    const target = this.deferredMsg ?? this.replyMsg;
    if (!target) {
      return this.message.reply(payload as MessageReplyOptions);
    }
    return target.edit(payload as MessageReplyOptions);
  }

  public async followUp(options: string | ReplyPayload): Promise<Message> {
    const payload = this.normalize(options);
    return this.message.channel.isSendable()
      ? this.message.channel.send(payload as MessageReplyOptions)
      : this.message.reply(payload as MessageReplyOptions);
  }

  public async deleteReply(): Promise<void> {
    await this.deferredMsg?.delete().catch(() => null);
    await this.replyMsg?.delete().catch(() => null);
  }

  public isChatInputCommand(): boolean {
    return true;
  }

  private normalize(options: string | ReplyPayload): MessageReplyOptions {
    if (typeof options === "string") return { content: options };
    const { ephemeral: _e, fetchReply: _f, flags: _flags, ...rest } = options as InteractionReplyOptions & {
      fetchReply?: boolean;
    };
    // Drop Interaction-only flags that break Message#reply
    if (rest.content === null) delete (rest as { content?: unknown }).content;
    return rest as MessageReplyOptions;
  }
}

class PrefixOptions {
  private cursor = 0;
  private named = new Map<string, string>();

  constructor(
    private readonly message: Message,
    private readonly args: string[],
    optionNames: string[]
  ) {
    // Map positional args to option names when available
    for (let i = 0; i < optionNames.length && i < args.length; i++) {
      this.named.set(optionNames[i]!, args[i]!);
    }
  }

  private next(): string | null {
    if (this.cursor >= this.args.length) return null;
    return this.args[this.cursor++] ?? null;
  }

  private byName(name: string): string | null {
    if (this.named.has(name)) return this.named.get(name)!;
    return this.next();
  }

  public getString(name: string, required?: boolean): string | null {
    const v = this.byName(name);
    if (required && (v === null || v === undefined)) {
      throw new Error(`Eksik argüman: ${name}`);
    }
    return v;
  }

  public getInteger(name: string, required?: boolean): number | null {
    const raw = this.byName(name);
    if (raw === null) {
      if (required) throw new Error(`Eksik argüman: ${name}`);
      return null;
    }
    const n = parseInt(raw, 10);
    if (Number.isNaN(n)) {
      if (required) throw new Error(`Geçersiz sayı: ${name}`);
      return null;
    }
    return n;
  }

  public getNumber(name: string, required?: boolean): number | null {
    return this.getInteger(name, required);
  }

  public getBoolean(name: string, required?: boolean): boolean | null {
    const raw = this.byName(name)?.toLowerCase();
    if (raw === null || raw === undefined) {
      if (required) throw new Error(`Eksik argüman: ${name}`);
      return null;
    }
    if (["true", "1", "evet", "yes", "on"].includes(raw)) return true;
    if (["false", "0", "hayir", "hayır", "no", "off"].includes(raw)) return false;
    return null;
  }

  public getUser(name: string, required?: boolean): User | null {
    // Prefer mention
    const mentioned = this.message.mentions.users.first();
    if (mentioned) {
      this.byName(name); // consume positional if present
      return mentioned;
    }
    const raw = this.byName(name);
    if (!raw) {
      if (required) throw new Error(`Eksik kullanıcı: ${name}`);
      return null;
    }
    const id = raw.replace(/[<@!>]/g, "");
    return this.message.client.users.cache.get(id) ?? null;
  }

  public getMember(name: string): GuildMember | null {
    const mentioned = this.message.mentions.members?.first();
    if (mentioned) return mentioned;
    const raw = this.byName(name);
    if (!raw || !this.message.guild) return null;
    const id = raw.replace(/[<@!>]/g, "");
    return this.message.guild.members.cache.get(id) ?? null;
  }

  public getRole(name: string, required?: boolean): Role | null {
    const mentioned = this.message.mentions.roles.first();
    if (mentioned) {
      this.byName(name);
      return mentioned;
    }
    const raw = this.byName(name);
    if (!raw || !this.message.guild) {
      if (required) throw new Error(`Eksik rol: ${name}`);
      return null;
    }
    const id = raw.replace(/[<@&>]/g, "");
    return (
      this.message.guild.roles.cache.get(id) ??
      this.message.guild.roles.cache.find((r) => r.name.toLowerCase() === raw.toLowerCase()) ??
      null
    );
  }

  public getChannel(name: string, required?: boolean) {
    const mentioned = this.message.mentions.channels.first();
    if (mentioned) {
      this.byName(name);
      return mentioned;
    }
    const raw = this.byName(name);
    if (!raw || !this.message.guild) {
      if (required) throw new Error(`Eksik kanal: ${name}`);
      return null;
    }
    const id = raw.replace(/[<#>]/g, "");
    return this.message.guild.channels.cache.get(id) ?? null;
  }

  public getSubcommand(required?: boolean): string {
    // First arg is subcommand name for prefix: !autorole ekle @rol
    // Subcommands already consumed as command args[0] if we pass remaining
    const v = this.args[0];
    if (!v && required) throw new Error("Eksik alt komut");
    return v ?? "";
  }

  public getSubcommandGroup(): string | null {
    return null;
  }

  public getAttachment(): null {
    return this.message.attachments.first() ?? null;
  }
}

/** Extract ordered option names from slash command JSON data */
export function optionNamesFromData(data: unknown): string[] {
  if (!data || typeof data !== "object") return [];
  const d = data as { options?: Array<{ name: string; type?: number; options?: Array<{ name: string }> }> };
  if (!Array.isArray(d.options)) return [];

  const names: string[] = [];
  for (const opt of d.options) {
    // type 1 = subcommand, 2 = group — prefix uses first arg as subcommand
    if (opt.type === 1 || opt.type === 2) {
      // nested options of first subcommand not expanded here
      continue;
    }
    names.push(opt.name);
  }
  return names;
}
