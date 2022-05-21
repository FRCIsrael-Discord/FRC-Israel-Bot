import { ApplicationCommandOptionData, CommandInteraction, PermissionString } from "discord.js";
import { IBot } from "./IBot";

export interface ISlashCommand {
    name: string,
    category: string,
    description: string,
    devOnly?: boolean,
    permissions?: PermissionString[],
    botPermissions?: PermissionString[],
    options: ApplicationCommandOptionData[],
    execute: (bot: IBot, interaction: CommandInteraction, ...args: any) => Promise<any>;
}