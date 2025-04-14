import { ButtonInteraction, TextInputStyle } from 'discord.js';
import { Bot, Button } from '../../lib/types/discord';
import { ActionRowBuilder, ModalActionRowComponentBuilder, ModalBuilder, TextInputBuilder } from '@discordjs/builders';

module.exports = {
    id: 'configFRCUserButton',
    catergory: 'Team Manager',
    deferReply: false,

    execute: async (bot: Bot, interaction: ButtonInteraction) => {
        const modal = new ModalBuilder()
            .setCustomId('configFRCUserModal')
            .setTitle('הגדרות משתמש')

        const nicknameInput = new TextInputBuilder()
            .setCustomId('nicknameInput')
            .setLabel('Nickname')
            .setRequired(true)
            .setStyle(TextInputStyle.Short)

        const teamInput = new TextInputBuilder()
            .setCustomId('teamInput')
            .setLabel('Team Number')
            .setRequired(true)
            .setStyle(TextInputStyle.Short)

        const firstRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(nicknameInput)
        const secondRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(teamInput)

        modal.addComponents(firstRow, secondRow)

        await interaction.showModal(modal)
    }
} as Button