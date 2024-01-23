import { logInfo } from './utils/logger';
logInfo('Starting bot...')

import { Client, Collection, IntentsBitField, WebhookClient } from 'discord.js';
import { initDbClient } from './lib/database/mongo';
import { loadEvents } from './handlers/eventsHandler';
import { loadSlashCommands } from './handlers/slashCommandsHandler';
import { Bot } from './lib/types/discord/bot';
import { SlashCommand } from './lib/types/discord/slashCommand';
import { Event } from './lib/types/discord/event';
import { scheduleChannelLock } from './lib/schedulers';
import { loadButtons } from './handlers/buttonsHandler';
import { Button } from './lib/types/discord/button';
import { Modal } from './lib/types/discord/modal';
import { loadModals } from './handlers/modalsHandler';
import { getBotToken } from './config/config';

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

const events = new Collection<string, Event>();
const slashCommands = new Collection<string, SlashCommand>();
const buttons = new Collection<string, Button>();
const modals = new Collection<string, Modal>();

const bot: Bot = {
    client,
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
loadSlashCommands(bot, false);
loadButtons(bot, false);
loadModals(bot, false);

scheduleChannelLock(bot.client, FRCIsraelId);

client.login(getBotToken());