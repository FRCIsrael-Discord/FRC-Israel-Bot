import { ApplicationCommandOptionType, ChannelType, CommandInteraction } from 'discord.js';
import { setServerStaffChannelId, setSupportCooldown, setSupportForum, setSupportRole, setUghChannelId } from '../../config/config';
import { Bot, SlashCommand } from '../../lib/types/discord';
import { SupportType, forumSupportLabels } from '../../lib/types/support';
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
            name: 'staff-channel',
            description: 'Updates the staff channel ID in the config',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'channel',
                    description: 'The staff channel to set',
                    type: ApplicationCommandOptionType.Channel,
                    required: true,
                },
            ]
        },
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
    ],
    execute: async (bot: Bot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        const { options } = interaction;

        if (options.getSubcommand() === 'staff-channel') {
            const channel = options.getChannel('channel', true);

            try {
                setServerStaffChannelId(channel.id);
                await interaction.editReply({ content: `Staff channel has been updated!\nChannel: <#${channel.id}>` });
            } catch (err) {
                logError(err);
                return await interaction.editReply({ content: 'An error occurred while updating the staff channel!' });
            }
        } else if (options.getSubcommand() === 'ugh-channel') {
            const channel = options.getChannel('channel', true);

            try {
                setUghChannelId(channel.id);
                await interaction.editReply({ content: `אוח channel has been updated!\nChannel: <#${channel.id}>` });
            } catch (err) {
                logError(err);
                return await interaction.editReply({ content: 'An error occurred while updating the אוח channel!' });
            }
        }
    }
} as SlashCommand;