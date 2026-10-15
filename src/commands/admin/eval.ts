import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, code } from "../../utils/embeds.js";
import { inspect } from "node:util";

export default class EvalCommand extends Command {
  constructor() {
    super({
      name: "eval",
      description: "Kod çalıştırır (sadece owner)",
      category: "admin",
      cooldown: 3,
      ownerOnly: true,
      data: new SlashCommandBuilder()
        .setName("eval")
        .setDescription("Kod çalıştırır (sadece owner)")
        .addStringOption((o) => o.setName("kod").setDescription("Kod").setRequired(true))
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const code = interaction.options.getString("kod", true);
    await interaction.deferReply({ ephemeral: true });

    try {
      // eslint-disable-next-line no-eval
      let result = await eval(code);
      if (typeof result !== "string") result = inspect(result, { depth: 1 });
      result = String(result).slice(0, 1900);

      const embed = baseEmbed(Theme.success)
        .setAuthor({ name: "EVAL" })
        .setDescription([line(), "```js\n" + result + "\n```", line()].join("\n"));

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const embed = baseEmbed(Theme.danger)
        .setAuthor({ name: "EVAL" })
        .setDescription([line(), "```\n" + msg.slice(0, 1500) + "\n```", line()].join("\n"));
      await interaction.editReply({ embeds: [embed] });
    }
  }
}
