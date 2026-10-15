import { Collection } from "discord.js";
import { JsonStore } from "./JsonStore.js";

export interface SelfRoleEntry {
  roleId: string;
  label: string;
  emoji?: string;
  description?: string;
}

export interface SelfRolePanel {
  id: string;
  guildId: string;
  channelId: string;
  messageId: string;
  mode: "button" | "menu";
  title: string;
  description: string;
  roles: SelfRoleEntry[];
  /** if true, selecting adds; clicking again removes */
  toggle: boolean;
}

type Dump = Record<string, SelfRolePanel>; // panelId -> panel

/**
 * Persistent self-role panels (button + select).
 */
export class SelfRoleManager {
  private panels = new Collection<string, SelfRolePanel>();
  private store = new JsonStore<Dump>("selfroles.json");
  private ready = false;

  public async init(): Promise<void> {
    const data = await this.store.load({});
    for (const [k, v] of Object.entries(data)) this.panels.set(k, v);
    this.ready = true;
  }

  private persist(): void {
    if (!this.ready) return;
    const dump: Dump = {};
    for (const [k, v] of this.panels) dump[k] = v;
    this.store.save(dump);
  }

  public create(panel: SelfRolePanel): void {
    this.panels.set(panel.id, panel);
    this.persist();
  }

  public get(panelId: string): SelfRolePanel | undefined {
    return this.panels.get(panelId);
  }

  public getByMessage(messageId: string): SelfRolePanel | undefined {
    return this.panels.find((p) => p.messageId === messageId);
  }

  public list(guildId: string): SelfRolePanel[] {
    return [...this.panels.values()].filter((p) => p.guildId === guildId);
  }

  public remove(panelId: string): boolean {
    const ok = this.panels.delete(panelId);
    if (ok) this.persist();
    return ok;
  }

  public updateMessage(panelId: string, messageId: string, channelId: string): void {
    const p = this.panels.get(panelId);
    if (!p) return;
    p.messageId = messageId;
    p.channelId = channelId;
    this.persist();
  }
}
