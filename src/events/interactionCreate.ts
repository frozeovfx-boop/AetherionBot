import {
  Events,
  ChatInputCommandInteraction,
  Collection,
  ButtonInteraction,
  ModalSubmitInteraction,
  StringSelectMenuInteraction,
  GuildMember,
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  OverwriteType,
} from "discord.js";
import { Event } from "../structures/Event.js";
import type { YutaClient } from "../client/YutaClient.js";

export default class InteractionCreateEvent extends Event<typeof Events.InteractionCreate> {
  constructor() {
    super(Events.InteractionCreate);
  }

  public async execute(
    client: YutaClient,
    interaction: ChatInputCommandInteraction | ButtonInteraction | ModalSubmitInteraction | StringSelectMenuInteraction
  ): Promise<void> {
    if (interaction.isButton() && interaction.customId === "ticket_create") {
      await handleTicketCreate(client, interaction);
      return;
    }

    if (interaction.isButton() && interaction.customId === "ticket_close") {
      await handleTicketClose(interaction);
      return;
    }

    if (interaction.isModalSubmit() && interaction.customId === "confession_modal") {
      await handleConfession(client, interaction);
      return;
    }

    if (interaction.isButton() && interaction.customId.startsWith("sr_btn:")) {
      await handleSelfRoleButton(client, interaction);
      return;
    }

    if (interaction.isStringSelectMenu() && interaction.customId.startsWith("sr_menu:")) {
      await handleSelfRoleMenu(client, interaction);
      return;
    }

    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) {
      await interaction.reply({ content: "Bu komut yüklenemedi.", ephemeral: true }).catch(() => null);
      return;
    }

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

async function handleTicketCreate(client: YutaClient, interaction: ButtonInteraction): Promise<void> {
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

async function handleConfession(client: YutaClient, interaction: ModalSubmitInteraction): Promise<void> {
  if (!interaction.guild) return;
  const cfg = client.settings.get(interaction.guild.id);
  if (!cfg.confessionChannelId) {
    await interaction.reply({ content: "İtiraf kanalı ayarlı değil.", ephemeral: true });
    return;
  }

  const text = interaction.fields.getTextInputValue("confession_text");
  try {
    const channel = await client.channels.fetch(cfg.confessionChannelId);
    if (!channel || !channel.isTextBased() || channel.isDMBased()) {
      await interaction.reply({ content: "Kanal bulunamadı.", ephemeral: true });
      return;
    }

    const { Theme, baseEmbed, line } = await import("../utils/embeds.js");
    await channel.send({
      embeds: [
        baseEmbed(Theme.info)
          .setAuthor({ name: "ANONİM İTİRAF" })
          .setDescription([line(), text.slice(0, 1500), line()].join("\n")),
      ],
    });

    await interaction.reply({ content: "İtirafın anonim olarak gönderildi.", ephemeral: true });
  } catch (err) {
    client.logger.error(err, "confession failed");
    await interaction.reply({ content: "Gönderilemedi.", ephemeral: true });
  }
}

async function handleSelfRoleButton(
  client: YutaClient,
  interaction: ButtonInteraction
): Promise<void> {
  // sr_btn:panelId:roleId
  const parts = interaction.customId.split(":");
  if (parts.length < 3) return;
  const panelId = parts[1]!;
  const roleId = parts[2]!;
  const panel = client.selfroles.get(panelId);
  if (!panel || !interaction.guild) {
    await interaction.reply({ content: "Panel artık yok.", ephemeral: true });
    return;
  }

  const member = interaction.member as GuildMember;
  if (!member || !("roles" in member)) {
    await interaction.reply({ content: "Üye bilgisi alınamadı.", ephemeral: true });
    return;
  }

  const role = interaction.guild.roles.cache.get(roleId);
  if (!role) {
    await interaction.reply({ content: "Rol silinmiş.", ephemeral: true });
    return;
  }

  try {
    if (member.roles.cache.has(roleId)) {
      await member.roles.remove(roleId, "Self-role toggle");
      await interaction.reply({ content: `Rol alındı: **${role.name}**`, ephemeral: true });
    } else {
      await member.roles.add(roleId, "Self-role toggle");
      await interaction.reply({ content: `Rol verildi: **${role.name}**`, ephemeral: true });
    }
  } catch {
    await interaction.reply({
      content: "Rol verilemedi. Bot rol sırasını ve yetkilerini kontrol et.",
      ephemeral: true,
    });
  }
}

async function handleSelfRoleMenu(
  client: YutaClient,
  interaction: StringSelectMenuInteraction
): Promise<void> {
  // sr_menu:panelId
  const panelId = interaction.customId.split(":")[1];
  if (!panelId) return;
  const panel = client.selfroles.get(panelId);
  if (!panel || !interaction.guild) {
    await interaction.reply({ content: "Panel artık yok.", ephemeral: true });
    return;
  }

  const member = interaction.member as GuildMember;
  if (!member || !("roles" in member)) {
    await interaction.reply({ content: "Üye bilgisi alınamadı.", ephemeral: true });
    return;
  }

  const allowed = new Set(panel.roles.map((r) => r.roleId));
  const selected = interaction.values.filter((id) => allowed.has(id));
  const current = member.roles.cache.filter((r) => allowed.has(r.id)).map((r) => r.id);

  const toAdd = selected.filter((id) => !current.includes(id));
  const toRemove = current.filter((id) => !selected.includes(id));

  try {
    if (toAdd.length) await member.roles.add(toAdd, "Self-role menu");
    if (toRemove.length) await member.roles.remove(toRemove, "Self-role menu");

    const names = selected
      .map((id) => interaction.guild!.roles.cache.get(id)?.name ?? id)
      .join(", ");
    await interaction.reply({
      content: selected.length
        ? `Rollerin güncellendi: **${names}**`
        : "Panel rolleri temizlendi.",
      ephemeral: true,
    });
  } catch {
    await interaction.reply({
      content: "Rol güncellenemedi. Bot rol sırasını kontrol et.",
      ephemeral: true,
    });
  }
}

