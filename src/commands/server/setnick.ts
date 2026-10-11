import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

export default class SetnickCommand extends Command {
  constructor() {
    super({
      name: "setnick",
      description: "Kendi takma adını değiştir",
      category: "server",
      cooldown: 5,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("setnick")
        .setDescription("Kendi takma adını değiştir")
        .addStringOption((o) =>
          o.setName("takma_ad").setDescription("Yeni ad (boş = sıfırla)").setRequired(false)
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild || !interaction.member) return;

    const nick = interaction.options.getString("takma_ad");
    const member = await interaction.guild.members.fetch(interaction.user.id);

    if (!member.manageable) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.danger).setDescription("Takma adın değiştirilemiyor.")],
        ephemeral: true,
      });
      return;
    }

    await member.setNickname(nick, "setnick");

    const embed = baseEmbed(Theme.success)
      .setAuthor({ name: "SERVER" })
      .setTitle("Takma Ad")
      .setDescription(
        [line(), kv("Yeni", nick ? code(nick) : "*sıfırlandı*"), line()].join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
}
