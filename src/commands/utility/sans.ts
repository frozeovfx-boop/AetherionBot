import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  GuildMember,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";
import { memberLuckWeight } from "../../utils/giveawayEnd.js";

export default class SansCommand extends Command {
  constructor() {
    super({
      name: "sans",
      description: "Çekiliş şans oranını göster",
      category: "utility",
      cooldown: 5,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("sans")
        .setDescription("Çekiliş şans oranını göster")
        .addUserOption((o) =>
          o.setName("kullanici").setDescription("Hedef").setRequired(false)
        )
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const user = interaction.options.getUser("kullanici") ?? interaction.user;
    const member =
      (interaction.options.getMember("kullanici") as GuildMember | null) ??
      (await interaction.guild.members.fetch(user.id).catch(() => null));

    const weight = memberLuckWeight(client, interaction.guild.id, member);
    const luck = client.settings.get(interaction.guild.id).giveawayLuck;
    const owned = member
      ? Object.entries(luck)
          .filter(([rid]) => member.roles.cache.has(rid))
          .map(([rid, w]) => `<@&${rid}> ×${w}`)
      : [];

    const all = Object.entries(luck).map(([rid, w]) => `<@&${rid}> ×${code(w)}`);

    const embed = baseEmbed(Theme.economy)
      .setAuthor({
        name: user.tag,
        iconURL: user.displayAvatarURL({ size: 64 }),
      })
      .setTitle("Çekiliş şansı")
      .setDescription(
        [
          line(),
          kv("Senin çarpanın", `**×${weight}**`),
          weight > 1
            ? "Ağırlıklı seçimde normal üyeye göre daha yüksek şans."
            : "Varsayılan şans (1×).",
          line(),
          owned.length ? `**Aktif şanslı rollerin**\n${owned.join("\n")}` : null,
          all.length ? `**Sunucu şanslı roller**\n${all.join("\n")}` : "**Şanslı rol yok** — herkes 1×",
          line(),
        ]
          .filter(Boolean)
          .join("\n")
      )
      .setFooter({ text: "Yuta · Giveaway" });

    await interaction.reply({ embeds: [embed] });
  }
}
