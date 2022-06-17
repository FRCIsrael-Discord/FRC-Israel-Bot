import { Client, GuildChannel } from 'discord.js';
import cron from 'node-cron';

export function scheduleChannelLock(client: Client, guildId: string) {
    cron.schedule("0 0 23 * * *", async function() {
        const guild = client.guilds.cache.get(guildId)!;
        const channel = guild.channels.cache.get('963533940159840297') as GuildChannel;
        const roles = await guild.roles.fetch();
        await channel.permissionOverwrites.edit(roles.get('959144521621458974')!, {
            SEND_MESSAGES: false
        });
    });
    
    cron.schedule("0 0 07 * * *", async function() {
        const guild = client.guilds.cache.get(guildId)!;
        const channel = guild.channels.cache.get('963533940159840297') as GuildChannel;
        const roles = await guild.roles.fetch();
        await channel.permissionOverwrites.edit(roles.get('959144521621458974')!, {
            SEND_MESSAGES: true
        });
    });
}