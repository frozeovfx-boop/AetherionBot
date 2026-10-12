import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, kv } from "../../utils/embeds.js";

export default class StickyCommand extends Command {
  constructor() {
    super({
      name: "sticky",
      description: "Kanala yapışkan mesaj",
      category: "server",
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageMessages],
      data: new SlashCommandBuilder()
        .setName("sticky")
        .setDescription("Kanala yapışkan mesaj")
        .addSubcommand((s) =>
          s
            .setName("ayarla")
            .setDescription("Sticky mesaj ayarla")
            .addStringOption((o) => o.setName("mesaj").setDescription("İçerik").setRequired(true))
        )
        .addSubcommand((s) => s.setName("kaldir").setDescription("Sticky kaldır"))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild || !interaction.channel) return;
    const sub = interaction.options.getSubcommand();

    if (sub === "kaldir") {
      client.settings.setSticky(interaction.guild.id, interaction.channel.id, null);
      await interaction.reply({
        embeds: [baseEmbed(Theme.mute).setDescription("Sticky kaldırıldı.")],
      });
      return;
    }

    const text = interaction.options.getString("mesaj", true);
    client.settings.setSticky(interaction.guild.id, interaction.channel.id, text);

    await interaction.reply({
      embeds: [
        baseEmbed(Theme.success)
          .setAuthor({ name: "STICKY" })
          .setDescription([line(), kv("Mesaj", text.slice(0, 200)), line()].join("\n")),
      ],
    });
  }
}
