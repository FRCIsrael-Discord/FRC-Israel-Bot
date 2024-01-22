import { Client, GuildChannel } from 'discord.js';
import cron from 'node-cron';
import { getUghChannelId } from '../config/config';

export function scheduleChannelLock(client: Client, guildId: string) {
    const channelId = getUghChannelId();

    cron.schedule('0 0 23 * * *', async function () {
        const guild = client.guilds.cache.get(guildId)!;
        const channel = guild.channels.cache.get(channelId) as GuildChannel;
        const roles = await guild.roles.fetch();
        const everyoneRole = roles.get(guild.roles.everyone.id);
        await channel.permissionOverwrites.edit(everyoneRole!, {
            SendMessages: false
        });
    });

    cron.schedule('0 0 07 * * *', async function () {
        const guild = client.guilds.cache.get(guildId)!;
        const channel = guild.channels.cache.get(channelId) as GuildChannel;
        const roles = await guild.roles.fetch();
        const everyoneRole = roles.get(guild.roles.everyone.id);
        await channel.permissionOverwrites.edit(everyoneRole!, {
            SendMessages: true
        });
    });
}