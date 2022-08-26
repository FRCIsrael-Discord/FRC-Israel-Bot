import { CommandInteraction, GuildMember } from 'discord.js';
import { IBot } from '../../utils/interfaces/IBot';
import { ISlashCommand } from '../../utils/interfaces/ISlashCommand';
import { addTeamRole, getNoTeamRoleId, getTeamRoles, isTeamRoleExists, setFTCTeamRoleId, setNoTeamRoleId } from '../../utils/rolesJsonHandler';

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
    name: 'teamconfig',
    category: 'Team Manager',
    description: 'Config teams info and data',
    devOnly: false,
    permissions: ['SEND_MESSAGES', 'ADMINISTRATOR'],
    botPermissions: ['MANAGE_ROLES', 'SEND_MESSAGES'],

    options: [
        {
            name: 'noteam',
            type: 'SUB_COMMAND',
            description: 'Update the group no team role id',
            options: [
                {
                    name: 'role',
                    type: 'ROLE',
                    required: true,
                    description: "The role to set as no team role"
                }
            ],
        },
        {
            name: 'teams',
            type: 'SUB_COMMAND',
            description: 'Update the group teams role ids',
        },
        {
            name: 'ftc',
            type: 'SUB_COMMAND',
            description: 'Update the group ftc role id',
            options: [
                {
                    name: 'role',
                    type: 'ROLE',
                    required: true,
                    description: "The role to set as ftc team role"
                }
            ],
        }

    ],
    
    execute: async (bot: IBot, interaction: CommandInteraction) => { 
        const { options, guild } = interaction;
        const member: GuildMember = interaction.member as GuildMember
        const subCommand = options.getSubcommand();
        if (subCommand == 'noteam') {
            if (!(member?.permissions.has('ADMINISTRATOR') || guild?.ownerId == member.id)) {
                await interaction.reply({content: 'You must be an administrator to use this command!', ephemeral: true});
                return;
            }
            const role = options.getRole('role')!;
            setFTCTeamRoleId(role.id);
            await interaction.reply({content: `FTC Team role id has been set to ${role.id}`, ephemeral: true});
        } else if (subCommand == 'ftc') {
            if (!(member?.permissions.has('ADMINISTRATOR') || guild?.ownerId == member.id)) {
                await interaction.reply({content: 'You must be an administrator to use this command!', ephemeral: true});
                return;
            }
            const role = options.getRole('role')!;
            setNoTeamRoleId(role.id);
            await interaction.reply({content: `No Team role id has been set to ${role.id}`, ephemeral: true});
        } else if (subCommand == 'teams') {
            if (!(member.permissions.has('ADMINISTRATOR') || guild?.ownerId == member.id)) {
                await interaction.reply({content: 'You must be an administrator to use this command!', ephemeral: true});
                return;
            }
            await interaction.deferReply({ephemeral: true});
            const guildRoles = await guild!.roles.fetch();
            let amount = 0;
            guildRoles.forEach(role => {
                if (teamList.includes(role.name.split(" | ")[1]) && !isTeamRoleExists(role.id)) {
                    amount++;
                    addTeamRole(role.id);
                }
            });
            await interaction.editReply({content: `Added ${amount} new team roles.`});
        }
    }
} as ISlashCommand;