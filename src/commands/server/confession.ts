import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  ChannelType,
  TextChannel,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, kv } from "../../utils/embeds.js";

export default class ConfessionCommand extends Command {
  constructor() {
    super({
      name: "confession",
      description: "Anonim itiraf sistemi",
      category: "server",
      cooldown: 15,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("confession")
        .setDescription("Anonim itiraf sistemi")
        .addSubcommand((s) =>
          s
            .setName("ayarla")
            .setDescription("İtiraf kanalı")
            .addChannelOption((o) =>
              o
                .setName("kanal")
                .setDescription("Kanal")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
            )
        )
        .addSubcommand((s) => s.setName("kapat").setDescription("İtiraf sistemini kapat"))
        .addSubcommand((s) => s.setName("gonder").setDescription("Anonim itiraf gönder"))
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const sub = interaction.options.getSubcommand();

    if (sub === "ayarla") {
      if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
        await interaction.reply({ content: "Yetkin yok.", ephemeral: true });
        return;
      }
      const ch = interaction.options.getChannel("kanal", true) as TextChannel;
      client.settings.setConfession(interaction.guild.id, ch.id);
      await interaction.reply({
        embeds: [
          baseEmbed(Theme.success)
            .setAuthor({ name: "CONFESSION" })
            .setDescription([line(), kv("Kanal", `${ch}`), line()].join("\n")),
        ],
      });
      return;
    }

    if (sub === "kapat") {
      if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
        await interaction.reply({ content: "Yetkin yok.", ephemeral: true });
        return;
      }
      client.settings.setConfession(interaction.guild.id, null);
      await interaction.reply({
        embeds: [baseEmbed(Theme.mute).setDescription("İtiraf sistemi kapatıldı.")],
      });
      return;
    }

    // gonder → modal
    const cfg = client.settings.get(interaction.guild.id);
    if (!cfg.confessionChannelId) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.warning).setDescription("İtiraf kanalı ayarlı değil.")],
        ephemeral: true,
      });
      return;
    }

    const modal = new ModalBuilder().setCustomId("confession_modal").setTitle("Anonim İtiraf");
    const input = new TextInputBuilder()
      .setCustomId("confession_text")
      .setLabel("İtirafın")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setMaxLength(1500);
    modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(input));
    await interaction.showModal(modal);
  }
}
