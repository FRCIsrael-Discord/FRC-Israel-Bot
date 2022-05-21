import { Client, Message } from "discord.js";
import { IBot } from "../../utils/interfaces/IBot";
import { ICommand } from "../../utils/interfaces/ICommand";

module.exports = {
    name: "ping",
    category: "info",
    permissions: ['SEND_MESSAGES'],
    botPermissions: ['SEND_MESSAGES'],
    devOnly: true,
    execute: async (bot: IBot, message: Message, ...args: any) => {
        message.reply("Pong!");
    }
} as ICommand;