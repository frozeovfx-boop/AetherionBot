import {
  ChatInputCommandInteraction,
  GuildMember,
  PermissionResolvable,
  PermissionsBitField,
} from "discord.js";

export function memberHasPermissions(
  member: GuildMember,
  permissions: PermissionResolvable[]
): boolean {
  if (member.id === member.guild.ownerId) return true;
  return member.permissions.has(PermissionsBitField.resolve(permissions));
}

export function canModerate(
  executor: GuildMember,
  target: GuildMember
): { ok: boolean; reason?: string } {
  if (executor.id === target.id) {
    return { ok: false, reason: "Kendine işlem uygulayamazsın." };
  }

  if (target.id === executor.guild.ownerId) {
    return { ok: false, reason: "Sunucu sahibine işlem uygulayamazsın." };
  }

  if (executor.id === executor.guild.ownerId) return { ok: true };

  if (target.roles.highest.position >= executor.roles.highest.position) {
    return { ok: false, reason: "Bu kullanıcı senden yüksek veya eşit role sahip." };
  }

  if (!target.moderatable && !target.bannable && !target.kickable) {
    return { ok: false, reason: "Bu kullanıcıya işlem uygulayamıyorum (yetki hiyerarşisi)." };
  }

  return { ok: true };
}

export async function ensurePermissions(
  interaction: ChatInputCommandInteraction,
  userPerms: PermissionResolvable[],
  clientPerms: PermissionResolvable[] = []
): Promise<boolean> {
  if (!interaction.guild || !interaction.member) return false;

  const member = interaction.member as GuildMember;
  const me = interaction.guild.members.me;

  if (!memberHasPermissions(member, userPerms)) {
    await interaction.reply({
      content: "Bu komutu kullanmak için yeterli yetkiye sahip değilsin.",
      ephemeral: true,
    });
    return false;
  }

  if (me && clientPerms.length > 0 && !me.permissions.has(PermissionsBitField.resolve(clientPerms))) {
    await interaction.reply({
      content: "Bu işlemi yapmak için bende yeterli yetki yok.",
      ephemeral: true,
    });
    return false;
  }

  return true;
}
