import path from "path";
import { getFiles } from "../utils/filesReader";
import { IBot } from "../utils/interfaces/IBot";
import { ISlashCommand } from "../utils/interfaces/ISlashCommand";
import * as fs from "fs";
import { logInfo } from "../utils/logger";

export function loadSlashCommands(bot: IBot, reload: boolean) {
    const { slashCommands } = bot;

    const commandsPath = path.join(__dirname, "../slashCommands");
    fs.readdirSync(commandsPath).forEach((category: string) => {
        const commandPath = path.join(commandsPath, category);
        let slashCommandsFiles = getFiles(commandPath, ".ts");

        slashCommandsFiles.forEach((f) => {
            if (reload)
                delete require.cache[require.resolve(`../slashCommands/${category}/${f}`)]
            const command: ISlashCommand = require(`../slashCommands/${category}/${f}`)
            slashCommands.set(command.name, command)
        })
    })
    logInfo(`Loaded ${slashCommands.size} slash commands`)
}