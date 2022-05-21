import { Client, Collection } from "discord.js";
import { getFiles } from "../utils/filesReader";
import * as fs from "fs";
import { IBot } from "../utils/interfaces/IBot";
import { ICommand } from "../utils/interfaces/ICommand";

export function loadCommands(bot: IBot, reload: boolean) {
    const { commands, client } = bot;

    fs.readdirSync("./src/commands/").forEach((category) => {
        let commandsFiles = getFiles(`./src/commands/${category}`, ".ts")

        commandsFiles.forEach((f) => {
            if (reload)
                delete require.cache[require.resolve(`../commands/${category}/${f}`)]
            const command: ICommand = require(`../commands/${category}/${f}`)
            commands.set(command.name, command)
        })
    })
    console.log(`Loaded ${commands.size} commands`)
}