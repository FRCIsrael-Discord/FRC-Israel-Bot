import * as fs from 'fs';
import path from 'path';
import { Bot, Modal } from '../lib/interfaces/discord';
import { getFiles } from '../utils/filesReader';
import { logInfo } from '../utils/logger';

export function loadModals(bot: Bot, reload: boolean) {
    const { modals } = bot;

    const modalsPath = path.join(__dirname, '../modals');
    fs.readdirSync(modalsPath).forEach((category: string) => {
        const modalPath = path.join(modalsPath, category);
        let modalsFiles = getFiles(modalPath, '.ts');

        modalsFiles.forEach((f) => {
            if (reload)
                delete require.cache[require.resolve(`../modals/${category}/${f}`)]
            const modal: Modal = require(`../modals/${category}/${f}`)
            modals.set(modal.id, modal)
        })
    })
    logInfo(`Loaded ${modals.size} modals`)
}