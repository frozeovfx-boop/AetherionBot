import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class BanlistCommand extends Command {
  constructor() {
    super({
      name: "banlist",
      description: "Yasaklı kullanıcıları listeler",
      category: "moderation",
      cooldown: 10,
      guildOnly: true,
      permissions: [PermissionFlagsBits.BanMembers],
      data: new SlashCommandBuilder()
        .setName("banlist")
        .setDescription("Yasaklı kullanıcıları listeler")
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    await interaction.deferReply({ ephemeral: true });
    const bans = await interaction.guild.bans.fetch();
    if (bans.size === 0) {
      await interaction.editReply({ content: "Yasaklı kullanıcı yok." });
      return;
    }
    const lines = [...bans.values()].slice(0, 20).map((b) => `• ${b.user.tag} (\`${b.user.id}\`) — ${b.reason ?? "sebep yok"}`);
    const embed = new EmbedBuilder()
      .setColor(0xed4245)
      .setTitle(`Ban Listesi (${bans.size})`)
      .setDescription(lines.join("\n"))
      .setTimestamp();
    await interaction.editReply({ embeds: [embed] });
  }
}
