import { Message, PermissionString } from "discord.js";
import { IBot } from "./IBot";

export interface ICommand {
    name: string,
    category: string,
    permissions?: PermissionString[],
    botPermissions?: PermissionString[],
    devOnly?: boolean,
    execute: (bot: IBot, message: Message) => Promise<any>;
}