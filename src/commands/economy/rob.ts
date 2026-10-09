import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

const COOLDOWN = 2 * 60 * 60 * 1000;
const robCooldown = new Map<string, number>();

export default class RobCommand extends Command {
  constructor() {
    super({
      name: "rob",
      description: "Başka bir kullanıcıyı soymaya çalış",
      category: "economy",
      cooldown: 5,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("rob")
        .setDescription("Başka bir kullanıcıyı soymaya çalış")
        .addUserOption((opt) =>
          opt.setName("kullanici").setDescription("Hedef").setRequired(true)
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const target = interaction.options.getUser("kullanici", true);
    const key = `${interaction.guild.id}:${interaction.user.id}`;
    const now = Date.now();

    if (target.id === interaction.user.id) {
      await interaction.reply({ content: "Kendini soyamazsın.", ephemeral: true });
      return;
    }

    if (target.bot) {
      await interaction.reply({ content: "Botları soyamazsın.", ephemeral: true });
      return;
    }

    const last = robCooldown.get(key);
    if (last && now - last < COOLDOWN) {
      const mins = Math.ceil((COOLDOWN - (now - last)) / 60_000);
      await interaction.reply({ content: `Soygun için **${mins} dk** beklemelisin.`, ephemeral: true });
      return;
    }

    const targetProfile = client.economy.get(interaction.guild.id, target.id);
    if (targetProfile.wallet < 50) {
      await interaction.reply({ content: "Hedefin cüzdanında yeterince para yok.", ephemeral: true });
      return;
    }

    robCooldown.set(key, now);

    const success = Math.random() < 0.4;
    if (success) {
      const stolen = Math.floor(targetProfile.wallet * (0.1 + Math.random() * 0.25));
      client.economy.removeWallet(interaction.guild.id, target.id, stolen);
      client.economy.addWallet(interaction.guild.id, interaction.user.id, stolen);

      const embed = new EmbedBuilder()
        .setColor(0x57f287)
        .setTitle("Soygun Başarılı")
        .setDescription(`${target} kullanıcısından **${stolen.toLocaleString()}** 💵 çaldın.`)
        .setTimestamp();
      await interaction.reply({ embeds: [embed] });
    } else {
      const fine = Math.floor(50 + Math.random() * 150);
      client.economy.removeWallet(interaction.guild.id, interaction.user.id, fine);

      const embed = new EmbedBuilder()
        .setColor(0xed4245)
        .setTitle("Soygun Başarısız")
        .setDescription(`Yakalandın! **${fine.toLocaleString()}** 💵 ceza ödedin.`)
        .setTimestamp();
      await interaction.reply({ embeds: [embed] });
    }
  }
}
