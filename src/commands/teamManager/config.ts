import { ApplicationCommandOptionType, CommandInteraction, GuildMember } from 'discord.js';
import { isTeamRoleExists, setNoTeamRoleId, setTeamRoles } from '../../config/config';
import { Bot, SlashCommand } from '../../lib/types/discord';
import { frcTeamList } from '../../utils/teamLists';

module.exports = {
    name: 'teamconfig',
    category: 'Team Manager',
    description: 'Config teams info and data',
    devOnly: false,
    ephemeral: true,
    permissions: ['SendMessages', 'Administrator'],
    botPermissions: ['ManageRoles', 'SendMessages'],

    options: [
        {
            name: 'noteam',
            type: ApplicationCommandOptionType.Subcommand,
            description: 'Update the group no team role id',
            options: [
                {
                    name: 'role',
                    type: ApplicationCommandOptionType.Role,
                    required: true,
                    description: 'The role to set as no team role'
                }
            ],
        },
        {
            name: 'teams',
            type: ApplicationCommandOptionType.Subcommand,
            description: 'Update the group teams role ids',
        }

    ],

    execute: async (bot: Bot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        const { options, guild } = interaction;
        const member: GuildMember = interaction.member as GuildMember
        const subCommand = options.getSubcommand();
        if (subCommand == 'noteam') {
            const role = options.getRole('role')!;
            setNoTeamRoleId(role.id);
            await interaction.editReply({ content: `No Team role id has been set to ${role.id}` });
        } else if (subCommand == 'teams') {
            const guildRoles = await guild!.roles.fetch();
            let amount = 0;
            const teamRoles: string[] = [];
            guildRoles.forEach(role => {
                if (frcTeamList.includes(role.name.split(' | ')[1]) && !isTeamRoleExists(role.id)) {
                    amount++;
                    teamRoles.push(role.id);
                }
            });
            setTeamRoles(teamRoles);
            await interaction.editReply({ content: `Added ${amount} new team roles.` });
        }
    }
} as SlashCommand;