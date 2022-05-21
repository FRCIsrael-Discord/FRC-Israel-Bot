import { Client, Collection } from "discord.js";
import { ICommand } from "./ICommand";
import { IEvent } from "./IEvent";
import { ISlashCommand } from "./ISlashCommand";

export interface IBot {
    client: Client,
    commands: Collection<string, ICommand>,
    events: Collection<string, IEvent>,
    slashCommands: Collection<string, ISlashCommand>,
    owners: string[],
    testServers: string[],
    prefix: string
}