import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, kv } from "../../utils/embeds.js";

export default class NukeCommand extends Command {
  constructor() {
    super({
      name: "nuke",
      description: "Kanalı klonlayıp siler (mesaj temizliği)",
      category: "moderation",
      cooldown: 30,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageChannels],
      clientPermissions: [PermissionFlagsBits.ManageChannels],
      data: new SlashCommandBuilder()
        .setName("nuke")
        .setDescription("Kanalı klonlayıp siler")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.channel || !("clone" in interaction.channel)) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.warning).setDescription("Bu kanal nukelenemez.")],
        ephemeral: true,
      });
      return;
    }

    const channel = interaction.channel as TextChannel;
    await interaction.reply({
      embeds: [baseEmbed(Theme.warning).setDescription("Nuke başlıyor...")],
      ephemeral: true,
    });

    const cloned = await channel.clone({ reason: `nuke · ${interaction.user.tag}` });
    await channel.delete(`nuke · ${interaction.user.tag}`);

    await cloned.send({
      embeds: [
        baseEmbed(Theme.danger)
          .setAuthor({ name: "MODERASYON" })
          .setTitle("Nuke")
          .setDescription(
            [
              line(),
              kv("Yetkili", interaction.user.tag),
              line(),
            ].join("\n")
          ),
      ],
    });
  }
}
