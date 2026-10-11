import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, kv } from "../../utils/embeds.js";

export default class CloneCommand extends Command {
  constructor() {
    super({
      name: "clone",
      description: "Kanalı klonlar",
      category: "server",
      cooldown: 10,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageChannels],
      clientPermissions: [PermissionFlagsBits.ManageChannels],
      data: new SlashCommandBuilder()
        .setName("clone")
        .setDescription("Kanalı klonlar")
        .addChannelOption((o) => o.setName("kanal").setDescription("Kanal").setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const target = (interaction.options.getChannel("kanal") ?? interaction.channel) as TextChannel | null;
    if (!target || !("clone" in target)) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.warning).setDescription("Bu kanal klonlanamaz.")],
        ephemeral: true,
      });
      return;
    }

    const cloned = await target.clone({ reason: `clone · ${interaction.user.tag}` });

    const embed = baseEmbed(Theme.success)
      .setAuthor({ name: "SERVER" })
      .setTitle("Klonlandı")
      .setDescription(
        [
          line(),
          kv("Kaynak", `${target}`),
          kv("Yeni", `${cloned}`),
          line(),
        ].join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
}
