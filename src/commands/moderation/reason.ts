import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

export default class ReasonCommand extends Command {
  constructor() {
    super({
      name: "reason",
      description: "Case sebebini günceller",
      category: "moderation",
      cooldown: 3,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ModerateMembers],
      data: new SlashCommandBuilder()
        .setName("reason")
        .setDescription("Case sebebini günceller")
        .addIntegerOption((o) => o.setName("id").setDescription("Case ID").setRequired(true).setMinValue(1))
        .addStringOption((o) => o.setName("sebep").setDescription("Yeni sebep").setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const id = interaction.options.getInteger("id", true);
    const reason = interaction.options.getString("sebep", true);
    const c = client.cases.get(interaction.guild.id, id);

    if (!c) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.mute).setDescription("Case bulunamadı.")],
        ephemeral: true,
      });
      return;
    }

    c.reason = reason;

    const embed = baseEmbed(Theme.success)
      .setAuthor({ name: "MODERASYON" })
      .setTitle(`Case #${id}`)
      .setDescription([line(), kv("Yeni sebep", reason), line()].join("\n"));

    await interaction.reply({ embeds: [embed] });
  }
}
