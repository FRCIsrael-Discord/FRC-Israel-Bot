import { ActionRowBuilder, ButtonBuilder } from '@discordjs/builders';
import { ApplicationCommandOptionType, ButtonStyle, CommandInteraction, TextChannel } from 'discord.js';
import { Bot, SlashCommand } from '../../lib/types/discord';

module.exports = {
    name: 'userconfig',
    category: 'Team Manager',
    description: 'Adds a button to config the user nickname and team role',
    devOnly: false,
    ephemeral: true,
    permissions: ['SendMessages', 'Administrator'],
    botPermissions: ['SendMessages'],

    options: [
        {
            name: 'channel-id',
            type: ApplicationCommandOptionType.String,
            description: 'Update the group no team role id',
            required: true,
        }
    ],

    execute: async (bot: Bot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        const { options, guild } = interaction;

        const buttons = new ActionRowBuilder<ButtonBuilder>().setComponents(
            new ButtonBuilder().setCustomId('configFRCUserButton').setLabel('FRC').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('configFTCUserButton').setLabel('FTC').setStyle(ButtonStyle.Primary)
        )

        const channel = guild?.channels.cache.get(options.getString('channel-id')!) as TextChannel;
        if (!channel) return await interaction.editReply({ content: 'Channel not found!' });

        await channel.send({ content: 'Choose your FIRST program to set your team role and nickname:', components: [buttons] }).catch(async () => {
            return await interaction.editReply({ content: 'I don\'t have permissions to send messages in that channel!' });
        });
        return await interaction.editReply({ content: 'Buttons added to the channel!' });
    }
} as SlashCommand;