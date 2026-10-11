import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  ChannelType,
  TextChannel,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

export default class SetwelcomeCommand extends Command {
  constructor() {
    super({
      name: "setwelcome",
      description: "Hoş geldin / ayrılış mesajları",
      category: "server",
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageGuild],
      data: new SlashCommandBuilder()
        .setName("setwelcome")
        .setDescription("Hoş geldin / ayrılış mesajları")
        .addSubcommand((s) =>
          s
            .setName("kanal")
            .setDescription("Welcome kanalını ayarla")
            .addChannelOption((o) =>
              o
                .setName("hedef")
                .setDescription("Kanal")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
            )
        )
        .addSubcommand((s) =>
          s
            .setName("mesaj")
            .setDescription("Hoş geldin mesajı")
            .addStringOption((o) =>
              o.setName("metin").setDescription("{user} {server} {count}").setRequired(true)
            )
        )
        .addSubcommand((s) =>
          s
            .setName("ayrilis")
            .setDescription("Ayrılış mesajı")
            .addStringOption((o) =>
              o.setName("metin").setDescription("{user} {server}").setRequired(true)
            )
        )
        .addSubcommand((s) => s.setName("kapat").setDescription("Welcome sistemini kapat"))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const sub = interaction.options.getSubcommand();

    if (sub === "kanal") {
      const ch = interaction.options.getChannel("hedef", true) as TextChannel;
      client.settings.setWelcome(interaction.guild.id, { channelId: ch.id });
    } else if (sub === "mesaj") {
      const metin = interaction.options.getString("metin", true);
      client.settings.setWelcome(interaction.guild.id, { message: metin });
    } else if (sub === "ayrilis") {
      const metin = interaction.options.getString("metin", true);
      client.settings.setWelcome(interaction.guild.id, { leaveMessage: metin });
    } else if (sub === "kapat") {
      client.settings.setWelcome(interaction.guild.id, { channelId: null });
    }

    const cfg = client.settings.get(interaction.guild.id);
    const embed = baseEmbed(Theme.success)
      .setAuthor({ name: "SERVER" })
      .setTitle("Welcome")
      .setDescription(
        [
          line(),
          kv("Kanal", cfg.welcomeChannelId ? `<#${cfg.welcomeChannelId}>` : "Kapalı"),
          kv("Hoş geldin", cfg.welcomeMessage.slice(0, 140)),
          kv("Ayrılış", cfg.leaveMessage.slice(0, 140)),
          line(),
          `Değişkenler: ${code("{user}")} ${code("{server}")} ${code("{count}")}`,
        ].join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
}
