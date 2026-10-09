import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class ReasonCommand extends Command {
  constructor() {
    super({
      name: "reason",
      description: "Bir case kaydının sebebini günceller",
      category: "moderation",
      cooldown: 3,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ModerateMembers],
      data: new SlashCommandBuilder()
        .setName("reason")
        .setDescription("Bir case kaydının sebebini günceller")
        .addIntegerOption((opt) =>
          opt.setName("id").setDescription("Case ID").setRequired(true).setMinValue(1)
        )
        .addStringOption((opt) =>
          opt.setName("sebep").setDescription("Yeni sebep").setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const id = interaction.options.getInteger("id", true);
    const newReason = interaction.options.getString("sebep", true);
    const modCase = client.cases.get(interaction.guild.id, id);

    if (!modCase) {
      await interaction.reply({ content: `Case #${id} bulunamadı.`, ephemeral: true });
      return;
    }

    const oldReason = modCase.reason;
    modCase.reason = newReason;

    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle(`Case #${id} Güncellendi`)
      .addFields(
        { name: "Eski Sebep", value: oldReason },
        { name: "Yeni Sebep", value: newReason }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
