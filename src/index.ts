import { Client, Intents } from 'discord.js';
import WOKCommands from 'wokcommands';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config();

const myTestServerId = '851789251754328064';
const FRCIsraelId = '959144521621458974'

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS
    ]
});



client.on('ready', () => {
    new WOKCommands(client, {
        commandDir: path.join(__dirname, 'commands'),
        typeScript: true,

        testServers: [myTestServerId, FRCIsraelId]
    });

    console.log("FRC Israel bot is now active!");
});

client.login(process.env.TOKEN);