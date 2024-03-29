import { ApplicationCommandOptionType, ChannelType, CommandInteraction } from 'discord.js';
import { getSupportWebhookURL, setSupportCooldown, setSupportForum, setSupportLogsChannelId, setSupportRole, setSupportWebhookURL } from '../../config/config';
import { Bot, SlashCommand } from '../../lib/types/discord';
import { SupportType, forumSupportLabels } from '../../lib/types/support';
import { logError } from '../../utils/logger';
import { initWebhookManager } from '../../lib/database/support/webhook';

module.exports = {
    name: 'support',
    category: 'Support',
    ephemeral: true,
    description: 'Configure support settings',
    permissions: ['ManageGuild'],
    botPermissions: ['SendMessages'],
    options: [
        {
            name: 'roles',
            description: 'Configure support roles',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'type',
                    description: 'The support type to set',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: Object.keys(forumSupportLabels).map(key => ({ name: forumSupportLabels[key as SupportType], value: key }))
                },
                {
                    name: 'role',
                    description: 'The support role to set',
                    required: true,
                    type: ApplicationCommandOptionType.Role,
                }
            ]
        },
        {
            name: 'channel',
            description: 'Configure support channel',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'channel',
                    description: 'The support channel to set',
                    type: ApplicationCommandOptionType.Channel,
                    required: true,
                    channelTypes: [ChannelType.GuildForum]
                }
            ]
        },
        {
            name: 'logs-channel',
            description: 'Configure support logs channel',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'channel',
                    description: 'The support logs channel to set',
                    type: ApplicationCommandOptionType.Channel,
                    required: true,
                }
            ]
        },

        {
            name: 'webhook',
            description: 'Configure the support webhook',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'id',
                    description: 'The support webhook ID to set',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: 'token',
                    description: 'The support webhook token to set',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                }
            ]
        },
        {
            name: 'cooldown',
            description: 'Configure support cooldown',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'cooldown',
                    description: 'The support cooldown to set (in seconds)',
                    type: ApplicationCommandOptionType.Integer,
                    required: true,
                    minValue: 0,
                }
            ]
        }
    ],
    execute: async (bot: Bot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        const { options } = interaction;

        if (options.getSubcommand() === 'channel') {
            const channel = options.getChannel('channel', true);

            try {
                setSupportForum(channel.id);
                await interaction.editReply({ content: `Support channel has been updated!\nChannel: <#${channel.id}>` });
            } catch (err) {
                logError(err);
                return await interaction.editReply({ content: 'An error occurred while updating support settings!' });
            }
        } else if (options.getSubcommand() === 'roles') {
            const type = options.getString('type', true) as SupportType;
            const role = options.getRole('role', true);

            try {
                setSupportRole(type, role.id);
                await interaction.editReply({ content: `Support settings for ${type} have been updated!\nRole: ${role}` });
            } catch (err) {
                logError(err);
                return await interaction.editReply({ content: 'An error occurred while updating support settings!' });
            }

            await interaction.editReply({ content: `Support role for ${type} have been updated!\nRole: ${role}` });
        } else if (options.getSubcommand() === 'cooldown') {
            const cooldown = options.getInteger('cooldown', true);

            try {
                setSupportCooldown(cooldown);
                await interaction.editReply({ content: `Support cooldown has been updated!\nCooldown: ${cooldown}` });
            } catch (err) {
                logError(err);
                return await interaction.editReply({ content: 'An error occurred while updating support settings!' });
            }
        } else if (options.getSubcommand() === 'webhook') {
            const webhookID = options.getString('id', true);
            const webhookToken = options.getString('token', true);
            const webhook = `${webhookID}/${webhookToken}`;

            try {
                const oldSupportWebhookURL = getSupportWebhookURL();
                setSupportWebhookURL(webhook);
                const result = await initWebhookManager(bot.client);
                if (!result) {
                    await interaction.editReply({ content: `Failed to fetch support webhook!` });
                    setSupportWebhookURL(oldSupportWebhookURL);
                } else {
                    await interaction.editReply({ content: `Support webhook has been updated!` });
                }
            }
            catch (err) {
                logError(err);
                return await interaction.editReply({ content: 'An error occurred while updating support settings!' });
            }
        } else if (options.getSubcommand() === 'logs-channel') {
            const channel = options.getChannel('channel', true);

            try {
                setSupportLogsChannelId(channel.id);
                await interaction.editReply({ content: `Support logs channel has been updated!\nChannel: <#${channel.id}>` });
            } catch (err) {
                logError(err);
                return await interaction.editReply({ content: 'An error occurred while updating support settings!' });
            }
        }
    }
} as SlashCommand;