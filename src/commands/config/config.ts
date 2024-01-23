import { ApplicationCommandOptionType, CommandInteraction } from 'discord.js';
import { setHelperRoleId, setUghChannelId } from '../../config/config';
import { Bot, SlashCommand } from '../../lib/types/discord';
import { logError } from '../../utils/logger';

module.exports = {
    name: 'config',
    category: 'Config',
    ephemeral: true,
    description: 'Configure config values',
    permissions: ['ManageGuild'],
    botPermissions: ['SendMessages'],
    options: [
        {
            name: 'ugh-channel',
            description: 'Updates the אוח channel ID in the config',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'channel',
                    description: 'The אוח channel to set',
                    type: ApplicationCommandOptionType.Channel,
                    required: true,
                },
            ]
        },
        {
            name: 'staff-role',
            description: 'Updates the staff role ID in the config',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'role',
                    description: 'The staff role to set',
                    type: ApplicationCommandOptionType.Role,
                    required: true,
                },
            ]
        }
    ],
    execute: async (bot: Bot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        const { options } = interaction;


        if (options.getSubcommand() === 'ugh-channel') {
            const channel = options.getChannel('channel', true);

            try {
                setUghChannelId(channel.id);
                await interaction.editReply({ content: `אוח channel has been updated!\nChannel: <#${channel.id}>` });
            } catch (err) {
                logError(err);
                return await interaction.editReply({ content: 'An error occurred while updating the אוח channel!' });
            }
        } else if (options.getSubcommand() === 'helper-role') {
            const role = options.getRole('role', true);

            try {
                setHelperRoleId(role.id);
                await interaction.editReply({ content: `Helper role has been updated!\nRole: <@&${role.id}>` });
            } catch (err) {
                logError(err);
                return await interaction.editReply({ content: 'An error occurred while updating the helper role!' });
            }
        }
    }
} as SlashCommand;