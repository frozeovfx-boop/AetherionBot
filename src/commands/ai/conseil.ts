import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { conseilEmbed, ConseilTheme, line, kv, code } from "../../utils/embeds.js";
import {
  runDebate,
  runConsult,
  runRoast,
  parseModels,
  VOICE,
  type ConseilRoles,
} from "../../ai/conseil.js";
import {
  availableProviders,
  hasAnyProvider,
  labelOf,
  type AIProviderName,
} from "../../ai/providers.js";

function rolesFromGuild(client: AetherionClient, guildId: string): ConseilRoles {
  const raw = client.settings.get(guildId).conseilRoles;
  const out: ConseilRoles = {};
  for (const [k, v] of Object.entries(raw)) {
    if (k === "grok" || k === "openai" || k === "anthropic" || k === "gemini") {
      out[k] = v;
    }
    if (k === "gpt") out.openai = v;
    if (k === "claude") out.anthropic = v;
  }
  return out;
}

export default class ConseilCommand extends Command {
  constructor() {
    super({
      name: "conseil",
      description: "Hybrid AI Conseil — debate, consult, roast",
      category: "ai",
      cooldown: 12,
      data: new SlashCommandBuilder()
        .setName("conseil")
        .setDescription("Hybrid AI Conseil — debate, consult, roast")
        .addSubcommand((s) =>
          s
            .setName("debate")
            .setDescription("Modeller kendi arasında tartışır")
            .addStringOption((o) =>
              o.setName("konu").setDescription("Tartışma konusu").setRequired(true)
            )
            .addStringOption((o) =>
              o
                .setName("modeller")
                .setDescription("Örn: Grok,GPT,Gemini")
                .setRequired(false)
            )
        )
        .addSubcommand((s) =>
          s
            .setName("consult")
            .setDescription("3 modelden süper sentez cevap")
            .addStringOption((o) =>
              o.setName("soru").setDescription("Soru").setRequired(true)
            )
        )
        .addSubcommand((s) =>
          s
            .setName("set_roles")
            .setDescription("Modele sunucu kişiliği ata")
            .addStringOption((o) =>
              o
                .setName("model")
                .setDescription("Model")
                .setRequired(true)
                .addChoices(
                  { name: "Grok", value: "grok" },
                  { name: "GPT", value: "openai" },
                  { name: "Gemini", value: "gemini" },
                  { name: "Claude", value: "anthropic" }
                )
            )
            .addStringOption((o) =>
              o
                .setName("kisilik")
                .setDescription("Örn: Sunucu Trollü, Bilge Profesör")
                .setRequired(true)
            )
        )
        .addSubcommand((s) =>
          s
            .setName("roast")
            .setDescription("Tatlı-sert roast")
            .addUserOption((o) =>
              o.setName("kullanici").setDescription("Hedef").setRequired(true)
            )
        )
        .addSubcommand((s) =>
          s.setName("status").setDescription("Conseil / provider durumu")
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const sub = interaction.options.getSubcommand();

    if (sub === "status") {
      const avail = availableProviders();
      const roles = interaction.guild
        ? client.settings.get(interaction.guild.id).conseilRoles
        : {};
      const embed = conseilEmbed(ConseilTheme.purple)
        .setAuthor({ name: "CONSEIL · STATUS" })
        .setDescription(
          [
            line(),
            kv("Providers", avail.length ? avail.map(labelOf).join(" · ") : "Yok"),
            kv(
              "Roller",
              Object.keys(roles).length
                ? Object.entries(roles)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join("\n")
                : "Varsayılan"
            ),
            line(),
            "*API key env'de olmalı: GROK / OPENAI / GOOGLE / ANTHROPIC*",
          ].join("\n")
        );
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    if (sub === "set_roles") {
      if (!interaction.guild) {
        await interaction.reply({ content: "Sadece sunucuda.", ephemeral: true });
        return;
      }
      if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
        await interaction.reply({ content: "Yetkin yok.", ephemeral: true });
        return;
      }
      const model = interaction.options.getString("model", true);
      const kisilik = interaction.options.getString("kisilik", true);
      client.settings.setConseilRole(interaction.guild.id, model, kisilik);

      const embed = conseilEmbed(ConseilTheme.cyan)
        .setAuthor({ name: "CONSEIL · ROLE" })
        .setDescription(
          [
            line(),
            kv("Model", code(model)),
            kv("Kişilik", kisilik),
            line(),
          ].join("\n")
        );
      await interaction.reply({ embeds: [embed] });
      return;
    }

    if (!hasAnyProvider()) {
      await interaction.reply({
        embeds: [
          conseilEmbed(ConseilTheme.purple)
            .setAuthor({ name: "CONSEIL" })
            .setDescription(
              [
                line(),
                "Hiçbir AI key yok.",
                code("GROK_API_KEY"),
                code("OPENAI_API_KEY"),
                code("GOOGLE_API_KEY"),
                code("ANTHROPIC_API_KEY"),
                line(),
              ].join("\n")
            ),
        ],
        ephemeral: true,
      });
      return;
    }

    const guildId = interaction.guild?.id ?? "";
    const roles = guildId ? rolesFromGuild(client, guildId) : {};

    if (sub === "debate") {
      await interaction.deferReply();
      const konu = interaction.options.getString("konu", true);
      const models = parseModels(interaction.options.getString("modeller"));

      try {
        const voices = await runDebate(konu, models, roles);
        if (!voices.length) {
          await interaction.editReply({
            embeds: [
              conseilEmbed().setDescription("Hiçbir model yanıt vermedi. Key'leri kontrol et."),
            ],
          });
          return;
        }

        const body = voices
          .map((v) => {
            const meta = VOICE[v.provider];
            return `${meta.emoji} **${meta.title}**\n${v.text}`;
          })
          .join(`\n\n${"─".repeat(24)}\n\n`);

        const embed = conseilEmbed(ConseilTheme.cyan)
          .setAuthor({ name: "AI CONSEIL DEBATE" })
          .setTitle(konu.slice(0, 200))
          .setDescription([line(), body, line()].join("\n"));

        await interaction.editReply({ embeds: [embed] });
      } catch (err) {
        client.logger.error(err, "conseil debate");
        await interaction.editReply({
          content: err instanceof Error ? err.message : "Debate başarısız.",
        });
      }
      return;
    }

    if (sub === "consult") {
      await interaction.deferReply();
      const soru = interaction.options.getString("soru", true);

      try {
        const { voices, synthesis } = await runConsult(soru, roles);

        const voiceBlock = voices
          .map((v) => {
            const meta = VOICE[v.provider];
            return `${meta.emoji} **${meta.title}** — ${v.text.slice(0, 280)}`;
          })
          .join("\n\n");

        const embed = conseilEmbed(ConseilTheme.purple)
          .setAuthor({ name: "AI CONSEIL CONSULT" })
          .setTitle(soru.slice(0, 200))
          .setDescription(
            [
              line(),
              voiceBlock,
              "",
              "━".repeat(20),
              "",
              "✦ **SÜPER CEVAP**",
              synthesis,
              line(),
            ].join("\n")
          );

        await interaction.editReply({ embeds: [embed] });
      } catch (err) {
        client.logger.error(err, "conseil consult");
        await interaction.editReply({
          content: err instanceof Error ? err.message : "Consult başarısız.",
        });
      }
      return;
    }

    if (sub === "roast") {
      await interaction.deferReply();
      const target = interaction.options.getUser("kullanici", true);

      let context = "";
      try {
        if (interaction.channel && "messages" in interaction.channel) {
          const msgs = await interaction.channel.messages.fetch({ limit: 30 });
          const fromTarget = [...msgs.values()]
            .filter((m) => m.author.id === target.id && m.content)
            .slice(0, 5)
            .map((m) => m.content.slice(0, 120));
          context = fromTarget.join("\n") || "";
        }
      } catch {
        /* ignore */
      }

      try {
        const roast = await runRoast(target.tag, context, roles);
        const embed = conseilEmbed(ConseilTheme.cyan)
          .setAuthor({ name: "CONSEIL · ROAST" })
          .setThumbnail(target.displayAvatarURL({ size: 256 }))
          .setDescription(
            [line(), `**Hedef:** ${target}`, "", roast, line()].join("\n")
          );

        await interaction.editReply({ embeds: [embed] });
      } catch (err) {
        client.logger.error(err, "conseil roast");
        await interaction.editReply({
          content: err instanceof Error ? err.message : "Roast başarısız.",
        });
      }
    }
  }
}
