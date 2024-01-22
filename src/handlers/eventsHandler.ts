import path from 'path';
import { Bot, Event } from '../lib/types/discord';
import { getFiles } from '../utils/filesReader';
import { logInfo } from '../utils/logger';

export function loadEvents(bot: Bot, reload: boolean) {
    const { client } = bot;

    const eventsPath = path.join(__dirname, '../events');
    let eventsFiles = getFiles(eventsPath, '.ts');
    if (eventsFiles.length === 0) {
        logInfo('No events found');
    }

    eventsFiles.forEach((fileName, index) => {
        if (reload) {
            delete require.cache[require.resolve(`../events/${fileName}`)];
        }

        const event: Event = require(`../events/${fileName}`)
        if (event.once) {
            client.once(event.name, (...args) => event.execute(bot, ...args));
        } else {
            client.on(event.name, (...args) => event.execute(bot, ...args));
        }
    })

    logInfo(`Loaded ${eventsFiles.length} events`)
}