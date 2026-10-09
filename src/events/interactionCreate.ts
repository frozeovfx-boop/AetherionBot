import {
  Events,
  ChatInputCommandInteraction,
  Collection,
  ButtonInteraction,
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  OverwriteType,
} from "discord.js";
import { Event } from "../structures/Event.js";
import type { AetherionClient } from "../client/AetherionClient.js";

export default class InteractionCreateEvent extends Event<typeof Events.InteractionCreate> {
  constructor() {
    super(Events.InteractionCreate);
  }

  public async execute(
    client: AetherionClient,
    interaction: ChatInputCommandInteraction | ButtonInteraction
  ): Promise<void> {
    if (interaction.isButton() && interaction.customId === "ticket_create") {
      await handleTicketCreate(client, interaction);
      return;
    }

    if (interaction.isButton() && interaction.customId === "ticket_close") {
      await handleTicketClose(interaction);
      return;
    }

    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

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

async function handleTicketCreate(client: AetherionClient, interaction: ButtonInteraction): Promise<void> {
  if (!interaction.guild || !interaction.member) return;

  const existing = interaction.guild.channels.cache.find(
    (c) => c.name === `ticket-${interaction.user.username.toLowerCase().slice(0, 20)}`
  );

  if (existing) {
    await interaction.reply({ content: `Zaten açık bir ticket'ın var: ${existing}`, ephemeral: true });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  const channel = await interaction.guild.channels.create({
    name: `ticket-${interaction.user.username}`.slice(0, 100),
    type: ChannelType.GuildText,
    permissionOverwrites: [
      {
        id: interaction.guild.id,
        deny: [PermissionFlagsBits.ViewChannel],
        type: OverwriteType.Role,
      },
      {
        id: interaction.user.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.AttachFiles,
          PermissionFlagsBits.ReadMessageHistory,
        ],
        type: OverwriteType.Member,
      },
      {
        id: client.user!.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels],
        type: OverwriteType.Member,
      },
    ],
    reason: `Ticket | ${interaction.user.tag}`,
  });

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle("🎫 Destek Talebi")
    .setDescription(
      `Merhaba ${interaction.user},\n\nSorununu detaylı anlat.\nYetkililer en kısa sürede bakacak.\n\nKapatmak için aşağıdaki butonu kullan.`
    )
    .setTimestamp();

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("ticket_close")
      .setLabel("Ticket'ı Kapat")
      .setStyle(ButtonStyle.Danger)
      .setEmoji("🔒")
  );

  await channel.send({ content: `${interaction.user}`, embeds: [embed], components: [row] });
  await interaction.editReply({ content: `Ticket oluşturuldu: ${channel}` });
}

async function handleTicketClose(interaction: ButtonInteraction): Promise<void> {
  if (!interaction.channel || !interaction.guild) return;

  await interaction.reply({ content: "Ticket 5 saniye içinde kapatılıyor..." });
  setTimeout(async () => {
    try {
      await interaction.channel?.delete("Ticket kapatıldı");
    } catch {
      // already deleted
    }
  }, 5000);
}
