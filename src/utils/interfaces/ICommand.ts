import { Message, PermissionResolvable } from "discord.js";
import { IBot } from "./IBot";

export interface ICommand {
    name: string,
    category: string,
    permissions?: PermissionResolvable[],
    botPermissions?: PermissionResolvable[],
    devOnly?: boolean,
    execute: (bot: IBot, message: Message) => Promise<any>;
}