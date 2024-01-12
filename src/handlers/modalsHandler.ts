import * as fs from "fs";
import path from "path";
import { getFiles } from "../utils/filesReader";
import { IBot } from "../utils/interfaces/IBot";
import { IModal } from "../utils/interfaces/IModal";
import { logInfo } from "../utils/logger";

export function loadModals(bot: IBot, reload: boolean) {
    const { modals } = bot;

    const modalsPath = path.join(__dirname, "../modals");
    fs.readdirSync(modalsPath).forEach((category: string) => {
        const modalPath = path.join(modalsPath, category);
        let modalsFiles = getFiles(modalPath, ".ts");

        modalsFiles.forEach((f) => {
            if (reload)
                delete require.cache[require.resolve(`../modals/${category}/${f}`)]
            const modal: IModal = require(`../modals/${category}/${f}`)
            modals.set(modal.id, modal)
        })
    })
    logInfo(`Loaded ${modals.size} modals`)
}