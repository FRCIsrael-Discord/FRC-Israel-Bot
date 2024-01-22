import { Client, Collection } from 'discord.js';
import { Event } from './event';
import { SlashCommand } from './slashCommand';
import { Button } from './button';
import { Modal } from './modal';

export interface Bot {
    client: Client,
    events: Collection<string, Event>,
    slashCommands: Collection<string, SlashCommand>,
    buttons: Collection<string, Button>,
    modals: Collection<string, Modal>,
    owners: string[],
    testServers: string[],
    prefix: string
}