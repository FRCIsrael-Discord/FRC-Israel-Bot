import { ApplicationCommandOptionData, CommandInteraction, PermissionResolvable } from 'discord.js';
import { Bot } from './bot';

export interface SlashCommand {
    name: string,
    category: string,
    description: string,
    devOnly?: boolean,
    ephemeral?: boolean,
    permissions?: PermissionResolvable[],
    botPermissions?: PermissionResolvable[],
    options: ApplicationCommandOptionData[],
    execute: (bot: Bot, interaction: CommandInteraction, ...args: any) => Promise<any>;
}