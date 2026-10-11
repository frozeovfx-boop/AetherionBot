import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

const CD = 2 * 60 * 60 * 1000;
const map = new Map<string, number>();

export default class RobCommand extends Command {
  constructor() {
    super({
      name: "rob",
      description: "Başka kullanıcıyı soymaya çalış",
      category: "economy",
      cooldown: 5,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("rob")
        .setDescription("Başka kullanıcıyı soymaya çalış")
        .addUserOption((o) => o.setName("kullanici").setDescription("Hedef").setRequired(true))
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const target = interaction.options.getUser("kullanici", true);
    if (target.bot || target.id === interaction.user.id) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.warning).setDescription("Geçersiz hedef.")],
        ephemeral: true,
      });
      return;
    }

    const key = `${interaction.guild.id}:${interaction.user.id}`;
    const now = Date.now();
    if (map.get(key) && now - map.get(key)! < CD) {
      const mins = Math.ceil((CD - (now - map.get(key)!)) / 60_000);
      await interaction.reply({
        embeds: [baseEmbed(Theme.warning).setDescription(`Polis peşinde. **${mins} dk** bekle.`)],
        ephemeral: true,
      });
      return;
    }

    const victim = client.economy.get(interaction.guild.id, target.id);
    if (victim.wallet < 50) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.mute).setDescription("Hedefin cüzdanı neredeyse boş.")],
        ephemeral: true,
      });
      return;
    }

    map.set(key, now);
    const success = Math.random() < 0.4;

    if (success) {
      const stolen = Math.floor(victim.wallet * (0.1 + Math.random() * 0.25));
      client.economy.removeWallet(interaction.guild.id, target.id, stolen);
      client.economy.addWallet(interaction.guild.id, interaction.user.id, stolen);

      const embed = baseEmbed(Theme.success)
        .setAuthor({ name: "ECONOMY" })
        .setTitle("Soygun Başarılı")
        .setDescription(
          [
            line(),
            kv("Hedef", target.tag),
            kv("Çalınan", `**${stolen.toLocaleString()}** 💵`),
            line(),
          ].join("\n")
        );
      await interaction.reply({ embeds: [embed] });
    } else {
      const fine = Math.floor(30 + Math.random() * 120);
      client.economy.removeWallet(interaction.guild.id, interaction.user.id, fine);

      const embed = baseEmbed(Theme.danger)
        .setAuthor({ name: "ECONOMY" })
        .setTitle("Yakalandın")
        .setDescription(
          [
            line(),
            kv("Hedef", target.tag),
            kv("Ceza", `**−${fine.toLocaleString()}** 💵`),
            line(),
          ].join("\n")
        );
      await interaction.reply({ embeds: [embed] });
    }
  }
}
