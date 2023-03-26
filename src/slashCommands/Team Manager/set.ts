import { ApplicationCommandOptionType, Collection, CommandInteraction, Guild, GuildMember, Role } from 'discord.js';
import { IBot } from '../../utils/interfaces/IBot';
import { ISlashCommand } from '../../utils/interfaces/ISlashCommand';
import { getNoTeamRoleId, getTeamRoles } from '../../utils/rolesJsonHandler';
import { frcTeamList, ftcTeamList } from '../../utils/teamLists';

module.exports = {
    name: 'set',
    category: 'Team Manager',
    description: 'Set info about a user',
    devOnly: false,
    ephemeral: true,
    permissions: ['SendMessages'],
    botPermissions: ['ManageRoles', 'SendMessages', 'ChangeNickname', 'ManageNicknames'],

    options: [
        {
            name: 'user',
            type: ApplicationCommandOptionType.Subcommand,
            description: 'Update the member nickname and group role',
            options: [
                {
                    name: 'nickname',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    description: "The nickname",
                },
                {
                    name: 'team_number',
                    type: ApplicationCommandOptionType.Number,
                    required: true,
                    description: "Your team number"
                },
                {
                    name: 'ftc',
                    type: ApplicationCommandOptionType.Boolean,
                    required: false,
                    description: "Is this a FTC team?"
                }
            ]
        }

    ],
    
    execute: async (bot: IBot, interaction: CommandInteraction) => { 
        if (!interaction.isChatInputCommand()) return;
        await interaction.deferReply({ephemeral: true});
        const { options, guild } = interaction;
        const member: GuildMember = interaction.member as GuildMember
        const subCommand = options.getSubcommand();
        if (subCommand == 'user') {
            const isFTC = options.getBoolean('ftc');
            const nickname = options.getString('nickname')!;
            const teamNumber = options.getNumber('team_number')!.toString();
            if (frcTeamList.includes(teamNumber) || ftcTeamList.includes(teamNumber)) {
                if (isFTC == null || isFTC == false) {
                    const teamRoles = getTeamRoles();
                    const memberRoles = member.roles.cache;
                    const guildRoles = await guild!.roles.fetch();

                    for (const role of teamRoles) {
                        if (memberRoles.find(r => r.id == role)) {
                            const guildRole = guildRoles.get(role);
                            if (guildRole) member.roles.remove(guildRole);
                        }
                    }

                    await setFRCRole(guildRoles, member, teamNumber, interaction);
                    await renameMember(member, guild!, nickname, teamNumber, interaction);
                } else if (isFTC) {
                    await setFTCRole(member, interaction);
                    await renameMember(member, guild!, nickname, teamNumber, interaction);
                }
            } else {
                await interaction.editReply({content: 'Team number is invalid!'});
            }
        }
    }
} as ISlashCommand;


async function renameMember(member: GuildMember, guild: Guild, nickname: string, teamNumber: string, interaction: CommandInteraction) {
    const newNick = `${nickname} | ${teamNumber}`;
    try {
        await member.setNickname(newNick);
        await interaction.editReply({content: `Your group has been updated to ${teamNumber}`});
    } catch (e) {
        if (guild?.ownerId == member.id) {
            await interaction.editReply({content: 'Can\'t change owner\'s nickname!'});
        } else {
            await interaction.editReply({content: 'Can\'t set nickname'});
        }
    }
}

async function setFRCRole(guildRoles: Collection<string, Role>, member: GuildMember, teamNumber: string, interaction: CommandInteraction) {
    await removeNoTeamRole(member, interaction);

    const newRole = guildRoles.find(role => role.name.split(" | ")[1] === teamNumber);
    if (newRole != undefined) {
        await member.roles.add(newRole);
    } else {
        await interaction.editReply({content: "Team role not found!"});
        return;
    }
}

async function setFTCRole(member: GuildMember, interaction: CommandInteraction) {
    await removeNoTeamRole(member, interaction);

    const newRole = await interaction.guild!.roles.fetch().then(roles => roles.find(role => role.name.toLowerCase() == "ftc"));
    if (newRole != undefined) {
        await member.roles.add(newRole);
    } else {
        await interaction.editReply({content: "FTC role not found!"});
        return;
    }
}

async function removeNoTeamRole(member: GuildMember, interaction: CommandInteraction) {
    const noTeamRole = await interaction.guild!.roles.fetch(getNoTeamRoleId());
    if (noTeamRole != undefined) await member.roles.remove(noTeamRole);
}
