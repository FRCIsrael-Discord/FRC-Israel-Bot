import { ButtonInteraction } from 'discord.js';
import { Bot } from './bot';

export interface Button {
    id: string;
    catergory: string;
    deferReply: boolean;
    ephemeral: boolean;
    execute: (bot: Bot, interaction: ButtonInteraction) => Promise<any>;
}