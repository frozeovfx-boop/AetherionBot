import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

export default class MembercountCommand extends Command {
  constructor() {
    super({
      name: "membercount",
      description: "Üye sayısı",
      category: "utility",
      cooldown: 5,
      guildOnly: true,
      data: new SlashCommandBuilder().setName("membercount").setDescription("Üye sayısı").toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const g = interaction.guild!;
    await g.members.fetch().catch(() => null);
    const total = g.memberCount;
    const bots = g.members.cache.filter((m) => m.user.bot).size;
    const humans = total - bots;
    const online = g.members.cache.filter((m) => m.presence?.status && m.presence.status !== "offline").size;

    const embed = baseEmbed(Theme.primary)
      .setAuthor({ name: g.name, iconURL: g.iconURL({ size: 64 }) ?? undefined })
      .setTitle("Üyeler")
      .setDescription(
        [
          line(),
          kv("Toplam", code(total.toLocaleString())),
          kv("İnsan", code(humans.toLocaleString())),
          kv("Bot", code(bots.toLocaleString())),
          kv("Online*", code(online.toLocaleString())),
          line(),
        ].join("\n")
      )
      .setFooter({ text: "*Presence intent gerekir · Aetherion" });

    await interaction.reply({ embeds: [embed] });
  }
}
