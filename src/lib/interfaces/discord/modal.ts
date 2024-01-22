import { ModalSubmitInteraction } from 'discord.js';
import { Bot } from './bot';

export interface Modal {
    id: string;
    catergory: string;
    deferReply: boolean;
    ephemeral: boolean;
    execute: (bot: Bot, interaction: ModalSubmitInteraction) => Promise<any>;
}