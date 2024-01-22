import { Events } from 'discord.js';
import { Bot, Event } from '../lib/interfaces/discord';
import { logInfo } from '../utils/logger';

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute: async (bot: Bot, ...args: any) => {
        const { client, testServers, slashCommands } = bot;
        testServers.forEach(async serverId => {
            const guild = client.guilds.cache.get(serverId);
            if (!guild) {
                return logInfo(`Server ${serverId} not found`);
            }

            await guild.commands.set([...slashCommands.values()]);
        });
        logInfo('FRC Israel bot is now active!');
    }
} as Event