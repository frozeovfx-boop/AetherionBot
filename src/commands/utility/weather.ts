import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

export default class WeatherCommand extends Command {
  constructor() {
    super({
      name: "weather",
      description: "Hava durumu",
      category: "utility",
      cooldown: 8,
      data: new SlashCommandBuilder()
        .setName("weather")
        .setDescription("Hava durumu")
        .addStringOption((o) => o.setName("sehir").setDescription("Şehir").setRequired(true))
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const city = interaction.options.getString("sehir", true);
    await interaction.deferReply();

    try {
      const url = `https://wttr.in/${encodeURIComponent(city)}?format=j1`;
      const res = await fetch(url, { headers: { "User-Agent": "YutaBot" } });
      if (!res.ok) throw new Error("fetch failed");
      const data = (await res.json()) as {
        current_condition?: Array<{
          temp_C?: string;
          FeelsLikeC?: string;
          humidity?: string;
          weatherDesc?: Array<{ value?: string }>;
          windspeedKmph?: string;
        }>;
        nearest_area?: Array<{ areaName?: Array<{ value?: string }>; country?: Array<{ value?: string }> }>;
      };

      const cur = data.current_condition?.[0];
      const area = data.nearest_area?.[0];
      if (!cur) throw new Error("no data");

      const place = [
        area?.areaName?.[0]?.value,
        area?.country?.[0]?.value,
      ].filter(Boolean).join(", ") || city;

      const embed = baseEmbed(Theme.info)
        .setAuthor({ name: "WEATHER" })
        .setTitle(place)
        .setDescription(
          [
            line(),
            kv("Durum", cur.weatherDesc?.[0]?.value ?? "—"),
            kv("Sıcaklık", code(`${cur.temp_C}°C`)),
            kv("Hissedilen", code(`${cur.FeelsLikeC}°C`)),
            kv("Nem", code(`${cur.humidity}%`)),
            kv("Rüzgar", code(`${cur.windspeedKmph} km/h`)),
            line(),
          ].join("\n")
        );

      await interaction.editReply({ embeds: [embed] });
    } catch {
      await interaction.editReply({
        embeds: [baseEmbed(Theme.danger).setDescription("Hava verisi alınamadı.")],
      });
    }
  }
}
