import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  parseEmoji,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

export default class StealCommand extends Command {
  constructor() {
    super({
      name: "steal",
      description: "Emojiyi sunucuya ekler",
      category: "utility",
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageGuildExpressions],
      clientPermissions: [PermissionFlagsBits.ManageGuildExpressions],
      data: new SlashCommandBuilder()
        .setName("steal")
        .setDescription("Emojiyi sunucuya ekler")
        .addStringOption((o) => o.setName("emoji").setDescription("Emoji").setRequired(true))
        .addStringOption((o) => o.setName("isim").setDescription("İsim").setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuildExpressions)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const raw = interaction.options.getString("emoji", true);
    const parsed = parseEmoji(raw);
    if (!parsed?.id) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.warning).setDescription("Geçerli bir özel emoji gir.")],
        ephemeral: true,
      });
      return;
    }

    const ext = parsed.animated ? "gif" : "png";
    const url = `https://cdn.discordapp.com/emojis/${parsed.id}.${ext}`;
    const name = (interaction.options.getString("isim") ?? parsed.name ?? "emoji").replace(/\W/g, "").slice(0, 32);

    try {
      const emoji = await interaction.guild.emojis.create({ attachment: url, name });
      const embed = baseEmbed(Theme.success)
        .setAuthor({ name: "UTILITY" })
        .setTitle("Emoji Eklendi")
        .setThumbnail(url)
        .setDescription(
          [
            line(),
            kv("İsim", code(emoji.name ?? name)),
            kv("ID", code(emoji.id)),
            line(),
          ].join("\n")
        );
      await interaction.reply({ embeds: [embed] });
    } catch {
      await interaction.reply({
        embeds: [baseEmbed(Theme.danger).setDescription("Emoji eklenemedi (limit / yetki).")],
        ephemeral: true,
      });
    }
  }
}
