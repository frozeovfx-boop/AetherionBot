import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class CasesCommand extends Command {
  constructor() {
    super({
      name: "cases",
      description: "Bir kullanıcının moderasyon kayıtlarını gösterir",
      category: "moderation",
      cooldown: 3,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ModerateMembers],
      data: new SlashCommandBuilder()
        .setName("cases")
        .setDescription("Bir kullanıcının moderasyon kayıtlarını gösterir")
        .addUserOption((opt) =>
          opt.setName("kullanici").setDescription("Hedef kullanıcı").setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const target = interaction.options.getUser("kullanici", true);
    const cases = client.cases.getUserCases(interaction.guild.id, target.id);

    if (cases.length === 0) {
      await interaction.reply({ content: `${target.tag} için kayıt bulunamadı.`, ephemeral: true });
      return;
    }

    const lines = cases
      .slice(0, 15)
      .map(
        (c) =>
          `\`#${c.id}\` **${c.type}** — ${c.reason.slice(0, 40)}${c.reason.length > 40 ? "…" : ""} — <t:${Math.floor(c.createdAt.getTime() / 1000)}:R>${c.active ? "" : " *(pasif)*"}`
      )
      .join("\n");

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`Kayıtlar — ${target.tag}`)
      .setDescription(lines)
      .setFooter({ text: `Toplam ${cases.length} kayıt` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
