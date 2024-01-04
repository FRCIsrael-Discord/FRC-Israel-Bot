import { Client, Collection, Events, Message, TextChannel } from "discord.js";
import { owners } from "..";
import { IBot } from "../utils/interfaces/IBot";
import { IEvent } from "../utils/interfaces/IEvent";
import { logError } from "../utils/logger";

module.exports = {
    name: Events.MessageCreate,
    once: false,
    execute: async function runAll(bot: IBot, message: Message) {
        const { client, commands, owners } = bot;
        if (!message.guild) return;
        if (message.author.bot) return;

        const cmdstr = message.content.slice(bot.prefix.length).trim().split(/ +/g).shift()?.toLowerCase();

        let command = commands.get(cmdstr!);
        if (!command) return;

        const member = message.member!;
        const channel = message.channel as TextChannel;

        if (command.devOnly && !owners.includes(member?.id!)) {
            return message.reply("This command is only for developers!");
        }

        if (command.permissions && !channel.permissionsFor(member).has(command.permissions)) {
            const missingPerms = channel.permissionsFor(member).missing(command.permissions!)
            return message.reply(`You don't have permission to use this command!\nMissing permissions: ${missingPerms?.join(', ')}`);
        }

        if (command.botPermissions && !channel?.permissionsFor(client.user!)?.has(command.botPermissions)) {
            const missingPerms = channel?.permissionsFor(client.user!)?.missing(command.botPermissions)
            return message.reply(`I don't have the required permissions to use this command!\nMissing permissions: ${missingPerms?.join(', ')}`);
        }

        try {
            await command.execute(bot, message);
        } catch (e) {
            console.log(e);
            logError(e);
        }
    }
} as IEvent;