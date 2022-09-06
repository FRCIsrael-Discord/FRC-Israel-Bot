console.log("Starting bot...")
import { Client, Collection, IntentsBitField } from 'discord.js';
import dotenv from 'dotenv';
import { loadEvents } from './handlers/eventsHandler';
import { loadCommands } from './handlers/commandsHandler';
import { loadSlashCommands } from './handlers/slashCommandsHandler';
import { IBot } from './utils/interfaces/IBot';
import { ISlashCommand } from './utils/interfaces/ISlashCommand';
import { IEvent } from './utils/interfaces/IEvent';
import { ICommand } from './utils/interfaces/ICommand';
import { scheduleChannelLock } from './utils/timeSchedulers';
dotenv.config();

const myTestServerId = '851789251754328064';
const FRCIsraelId = '959144521621458974'
const testServers = [myTestServerId, FRCIsraelId];

export const owners = ['306449257831989248']

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMembers
    ]
});

const commands = new Collection<string, ICommand>();
const events = new Collection<string, IEvent>();
const slashCommands = new Collection<string, ISlashCommand>();

const bot: IBot = {
    client,
    commands,
    events,
    slashCommands,
    owners,
    testServers,
    prefix: '!'
};

loadEvents(bot, false);
loadCommands(bot, false);
loadSlashCommands(bot, false);

scheduleChannelLock(bot.client, FRCIsraelId);

client.login(process.env.TOKEN);