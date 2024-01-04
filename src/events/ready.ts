import { Client, Events } from "discord.js"
import { IBot } from "../utils/interfaces/IBot"
import { IEvent } from "../utils/interfaces/IEvent"
import { logInfo } from "../utils/logger";

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute: async (bot: IBot, ...args: any) => {
        const { client, testServers, slashCommands } = bot;
        testServers.forEach(async serverId => {
            const guild = client.guilds.cache.get(serverId);
            if (!guild) {
                return logInfo(`Server ${serverId} not found`);
            }

            await guild.commands.set([...slashCommands.values()]);
        });
        logInfo("FRC Israel bot is now active!");
    }
} as IEvent