import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  codeBlock,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { inspect } from "node:util";

export default class EvalCommand extends Command {
  constructor() {
    super({
      name: "eval",
      description: "Kod çalıştırır (sadece owner)",
      category: "admin",
      cooldown: 0,
      ownerOnly: true,
      data: new SlashCommandBuilder()
        .setName("eval")
        .setDescription("Kod çalıştırır (sadece owner)")
        .addStringOption((opt) =>
          opt.setName("kod").setDescription("Çalıştırılacak kod").setRequired(true)
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const code = interaction.options.getString("kod", true);

    await interaction.deferReply({ ephemeral: true });

    try {
      let evaled = eval(code);
      if (evaled instanceof Promise) evaled = await evaled;
      if (typeof evaled !== "string") evaled = inspect(evaled, { depth: 1 });

      const output = String(evaled).slice(0, 1900);

      const embed = new EmbedBuilder()
        .setColor(0x57f287)
        .setTitle("Eval")
        .addFields(
          { name: "Input", value: codeBlock("ts", code.slice(0, 1000)) },
          { name: "Output", value: codeBlock("js", output) }
        );

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      const embed = new EmbedBuilder()
        .setColor(0xed4245)
        .setTitle("Eval Error")
        .addFields(
          { name: "Input", value: codeBlock("ts", code.slice(0, 1000)) },
          { name: "Error", value: codeBlock("js", String(error).slice(0, 1000)) }
        );

      await interaction.editReply({ embeds: [embed] });
    }
  }
}
