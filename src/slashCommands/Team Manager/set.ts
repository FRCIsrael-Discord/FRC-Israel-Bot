import { CommandInteraction, GuildMember } from 'discord.js';
import { IBot } from '../../utils/interfaces/IBot';
import { ISlashCommand } from '../../utils/interfaces/ISlashCommand';
import { addTeamRole, getNoTeamRoleId, getTeamRoles, isTeamRoleExists, setNoTeamRoleId } from '../../utils/rolesJsonHandler';

export const teamList: string[] = [
    '1574', '1576', '1577', '1580', '1657',
    '1690', '1937', '1942', '1943', '1954',
    '2096', '2212', '2230', '2231', '2630',
    '2679', '3065', '3075', '3083', '3211',
    '3316', '3339', '3388', '3835', '4319',
    '4320', '4338', '4416', '4586', '4590',
    '4661', '4744', '5135', '5291', '5554',
    '5614', '5635', '5654', '5715', '5928',
    '5951', '5987', '5990', '6104', '6168',
    '6230', '6738', '6740', '6741', '7039',
    '7067', '7112', '7177', '7845', '8175',
    '8223', '8843'
]

module.exports = {
    name: 'set',
    category: 'Team Manager',
    description: 'Set info about a user',
    devOnly: false,
    permissions: ['SEND_MESSAGES'],
    botPermissions: ['MANAGE_ROLES', 'SEND_MESSAGES', 'CHANGE_NICKNAME', 'MANAGE_NICKNAMES'],

    options: [
        {
            name: 'user',
            type: 'SUB_COMMAND',
            description: 'Update the member nickname and group role',
            options: [
                {
                    name: 'nickname',
                    type: 'STRING',
                    required: true,
                    description: "The nickname",
                },
                {
                    name: 'team_number',
                    type : 'NUMBER',
                    required: true,
                    description: "Your team number"
                }
            ]
        }

    ],
    
    execute: async (bot: IBot, interaction: CommandInteraction) => { 
        const { options, guild } = interaction;
        const member: GuildMember = interaction.member as GuildMember
        const subCommand = options.getSubcommand();
        if (subCommand == 'user') {
            const nickname = options.getString('nickname')!;
            const teamNumber = options.getNumber('team_number')!.toString();
            if (teamList.includes(teamNumber)) {
                await interaction.deferReply({ephemeral: true});
    
                const teamRoles = getTeamRoles();
                const memberRoles = member.roles.cache;
                const guildRoles = await guild!.roles.fetch();
    
                for (const role of teamRoles) {
                    if (memberRoles.find(r => r.id == role)) {
                        const guildRole = guildRoles.get(role);
                        if (guildRole) member.roles.remove(guildRole);
                    }
                }
    
                const noTeamRole = guildRoles.get(getNoTeamRoleId());
                if (noTeamRole != undefined) await member.roles.remove(noTeamRole);
    
                const newRole = guildRoles.find(role => role.name.split(" | ")[1] === teamNumber);
                if (newRole != undefined) {
                    await member.roles.add(newRole);
                } else {
                    await interaction.editReply({content: "Team role not found!"});
                    return;
                }
    
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
    
            } else {
                await interaction.reply({content: 'Team number is invalid!', ephemeral: true});
            }
        }
    }
} as ISlashCommand;