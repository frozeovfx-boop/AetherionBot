import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class WeatherCommand extends Command {
  constructor() {
    super({
      name: "weather",
      description: "Şehir hava durumu",
      category: "utility",
      cooldown: 5,
      data: new SlashCommandBuilder()
        .setName("weather")
        .setDescription("Şehir hava durumu")
        .addStringOption((opt) =>
          opt.setName("sehir").setDescription("Şehir adı").setRequired(true)
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const city = interaction.options.getString("sehir", true);
    await interaction.deferReply();

    try {
      // wttr.in — no API key required
      const res = await fetch(
        `https://wttr.in/${encodeURIComponent(city)}?format=j1`,
        { headers: { "User-Agent": "AetherionBot" } }
      );
      if (!res.ok) throw new Error("API");

      const data = (await res.json()) as {
        current_condition: Array<{
          temp_C: string;
          humidity: string;
          weatherDesc: Array<{ value: string }>;
          FeelsLikeC: string;
          windspeedKmph: string;
        }>;
        nearest_area: Array<{ areaName: Array<{ value: string }>; country: Array<{ value: string }> }>;
      };

      const cur = data.current_condition[0]!;
      const area = data.nearest_area[0]!;

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle(`🌤️ ${area.areaName[0]?.value ?? city}`)
        .setDescription(cur.weatherDesc[0]?.value ?? "—")
        .addFields(
          { name: "Sıcaklık", value: `${cur.temp_C}°C`, inline: true },
          { name: "Hissedilen", value: `${cur.FeelsLikeC}°C`, inline: true },
          { name: "Nem", value: `${cur.humidity}%`, inline: true },
          { name: "Rüzgar", value: `${cur.windspeedKmph} km/h`, inline: true },
          { name: "Ülke", value: area.country[0]?.value ?? "—", inline: true }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch {
      await interaction.editReply({ content: "Hava durumu alınamadı. Şehir adını kontrol et." });
    }
  }
}
