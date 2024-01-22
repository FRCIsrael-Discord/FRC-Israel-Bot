import { logInfo } from './utils/logger';
logInfo("Starting bot...")

import { Client, Collection, IntentsBitField } from 'discord.js';
import { initDbClient } from './lib/database/mongo';
import { loadEvents } from './handlers/eventsHandler';
import { loadCommands } from './handlers/commandsHandler';
import { loadSlashCommands } from './handlers/slashCommandsHandler';
import { IBot } from './utils/interfaces/IBot';
import { ISlashCommand } from './utils/interfaces/ISlashCommand';
import { IEvent } from './utils/interfaces/IEvent';
import { ICommand } from './utils/interfaces/ICommand';
import { scheduleChannelLock } from './utils/timeSchedulers';
import { loadButtons } from './handlers/buttonsHandler';
import { IButton } from './utils/interfaces/IButton';
import { IModal } from './utils/interfaces/IModal';
import { loadModals } from './handlers/modalsHandler';
import { getBotToken } from './utils/config';

const myTestServerId = '851789251754328064';
const FRCIsraelId = '959144521621458974'
const testServers = [myTestServerId, FRCIsraelId];

export const owners = ['306449257831989248']

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.MessageContent,
    ]
});

const commands = new Collection<string, ICommand>();
const events = new Collection<string, IEvent>();
const slashCommands = new Collection<string, ISlashCommand>();
const buttons = new Collection<string, IButton>();
const modals = new Collection<string, IModal>();

const bot: IBot = {
    client,
    commands,
    events,
    slashCommands,
    buttons,
    modals,
    owners,
    testServers,
    prefix: '!'
};

initDbClient();
loadEvents(bot, false);
loadCommands(bot, false);
loadSlashCommands(bot, false);
loadButtons(bot, false);
loadModals(bot, false);

scheduleChannelLock(bot.client, FRCIsraelId);

client.login(getBotToken());