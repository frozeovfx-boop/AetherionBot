import { JsonStore } from "./JsonStore.js";
import { randomBytes } from "node:crypto";

export interface Capsule {
  id: string;
  guildId: string;
  channelId: string;
  authorId: string;
  authorTag: string;
  content: string;
  openAt: number;
  opened: boolean;
}

type Dump = Capsule[];

export class CapsuleManager {
  private items: Capsule[] = [];
  private store = new JsonStore<Dump>("capsules.json");
  private ready = false;

  public async init(): Promise<void> {
    this.items = await this.store.load([]);
    this.ready = true;
  }

  private persist(): void {
    if (!this.ready) return;
    this.store.save(this.items);
  }

  public create(data: Omit<Capsule, "id" | "opened">): Capsule {
    const c: Capsule = {
      ...data,
      id: randomBytes(4).toString("hex"),
      opened: false,
    };
    this.items.push(c);
    this.persist();
    return c;
  }

  public due(now = Date.now()): Capsule[] {
    return this.items.filter((c) => !c.opened && c.openAt <= now);
  }

  public markOpened(id: string): void {
    const c = this.items.find((x) => x.id === id);
    if (c) {
      c.opened = true;
      this.persist();
    }
  }

  public listByUser(userId: string): Capsule[] {
    return this.items.filter((c) => c.authorId === userId && !c.opened);
  }
}
