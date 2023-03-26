import { ApplicationCommandOptionData, CommandInteraction, PermissionResolvable } from "discord.js";
import { IBot } from "./IBot";

export interface ISlashCommand {
    name: string,
    category: string,
    description: string,
    devOnly?: boolean,
    permissions?: PermissionResolvable[],
    botPermissions?: PermissionResolvable[],
    options: ApplicationCommandOptionData[],
    execute: (bot: IBot, interaction: CommandInteraction, ...args: any) => Promise<any>;
}