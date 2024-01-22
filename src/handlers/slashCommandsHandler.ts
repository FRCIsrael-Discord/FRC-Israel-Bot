import * as fs from "fs";
import path from "path";
import { Bot, SlashCommand } from "../lib/types/discord";
import { getFiles } from "../utils/filesReader";
import { logInfo } from "../utils/logger";

export function loadSlashCommands(bot: Bot, reload: boolean) {
    const { slashCommands } = bot;

    const commandsPath = path.join(__dirname, "../commands");
    fs.readdirSync(commandsPath).forEach((category: string) => {
        const commandPath = path.join(commandsPath, category);
        let slashCommandsFiles = getFiles(commandPath, ".ts");

        slashCommandsFiles.forEach((f) => {
            if (reload)
                delete require.cache[require.resolve(`../commands/${category}/${f}`)]
            const command: SlashCommand = require(`../commands/${category}/${f}`)
            slashCommands.set(command.name, command)
        })
    })
    logInfo(`Loaded ${slashCommands.size} slash commands`)
}