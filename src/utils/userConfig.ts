import { Collection, CommandInteraction, Guild, GuildMember, Interaction, Role } from "discord.js";
import { getFTCTeamRoleId, getNoTeamRoleId } from "./config";

export async function renameMember(member: GuildMember, guild: Guild, nickname: string, teamNumber: string) {
    const newNick = `${nickname} | ${teamNumber}`;

    try {
        await member.setNickname(newNick);
        return true;
    } catch (e) {
        return false;
    }
}

export async function setFRCRole(guildRoles: Collection<string, Role>, member: GuildMember, teamNumber: string, guild: Guild) {
    await removeNoTeamRole(member, guild);

    const newRole = guildRoles.find(role => role.name.split(" | ")[1] === teamNumber);
    if (newRole != undefined) {
        await member.roles.add(newRole);
        return true;
    }
    return false;
}

export async function setFTCRole(member: GuildMember, guild: Guild) {
    const ftcRoleId = getFTCTeamRoleId();
    await removeNoTeamRole(member, guild);

    const newRole = await guild.roles.fetch().then(roles => roles.find(role => role.id.toLowerCase() == ftcRoleId));
    if (newRole != undefined) {
        await member.roles.add(newRole);
        return true;
    }
    return false;
}

export async function removeNoTeamRole(member: GuildMember, guild: Guild) {
    const noTeamRole = await guild.roles.fetch(getNoTeamRoleId());
    if (noTeamRole != undefined) await member.roles.remove(noTeamRole);
}

export async function addNoTeamRole(member: GuildMember, guild: Guild) {
    const noTeamRole = await guild.roles.fetch(getNoTeamRoleId());
    if (noTeamRole != undefined) await member.roles.add(noTeamRole);
}

export async function hasNoTeamRole(member: GuildMember, guild: Guild) {
    const noTeamRole = await guild.roles.fetch(getNoTeamRoleId());
    if (noTeamRole != undefined) return member.roles.cache.has(noTeamRole.id);
    return false;
}