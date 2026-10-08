import { Events, ChatInputCommandInteraction } from "discord.js";
import { Event } from "../structures/Event.js";
import type { AetherionClient } from "../client/AetherionClient.js";
import { Collection } from "discord.js";

export default class InteractionCreateEvent extends Event<typeof Events.InteractionCreate> {
  constructor() {
    super(Events.InteractionCreate);
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    // Cooldown
    if (!client.cooldowns.has(command.name)) {
      client.cooldowns.set(command.name, new Collection());
    }

    const now = Date.now();
    const timestamps = client.cooldowns.get(command.name)!;
    const cooldownAmount = command.cooldown * 1000;

    if (timestamps.has(interaction.user.id)) {
      const expiration = timestamps.get(interaction.user.id)! + cooldownAmount;
      if (now < expiration) {
        const remaining = ((expiration - now) / 1000).toFixed(1);
        await interaction.reply({
          content: `Bu komutu tekrar kullanabilmek için **${remaining}** saniye beklemelisin.`,
          ephemeral: true,
        });
        return;
      }
    }

    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

    // Owner only
    if (command.ownerOnly && !client.config.ownerIds.includes(interaction.user.id)) {
      await interaction.reply({ content: "Bu komutu sadece bot sahibi kullanabilir.", ephemeral: true });
      return;
    }

    try {
      await command.execute(client, interaction);
    } catch (error) {
      client.logger.error(error, `Error executing command ${command.name}`);
      const reply = { content: "Komut çalıştırılırken bir hata oluştu.", ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(reply);
      } else {
        await interaction.reply(reply);
      }
    }
  }
}
