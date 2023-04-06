import { ButtonInteraction, TextInputStyle } from "discord.js";
import { IBot } from "../../utils/interfaces/IBot";
import { ActionRowBuilder, ModalActionRowComponentBuilder, ModalBuilder, TextInputBuilder } from "@discordjs/builders";
import { IButton } from "../../utils/interfaces/IButton";

module.exports = {
    id: 'configFTCUserButton',
    catergory: 'Team Manager',
    deferReply: false,

    execute: async (bot: IBot, interaction: ButtonInteraction) => {
        const modal = new ModalBuilder()
            .setCustomId('configFTCUserModal')
            .setTitle('הגדרות משתמש (FTC)')

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
} as IButton