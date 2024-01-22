import * as fs from 'fs';
import path from 'path';
import { Bot, Button } from '../lib/types/discord';
import { getFiles } from '../utils/filesReader';
import { logInfo } from '../utils/logger';

export function loadButtons(bot: Bot, reload: boolean) {
    const { buttons } = bot;

    const buttonsPath = path.join(__dirname, '../buttons');
    fs.readdirSync(buttonsPath).forEach((category: string) => {
        const buttonPath = path.join(buttonsPath, category);
        let buttonsFiles = getFiles(buttonPath, '.ts');

        buttonsFiles.forEach((f) => {
            if (reload)
                delete require.cache[require.resolve(`../buttons/${category}/${f}`)]
            const button: Button = require(`../buttons/${category}/${f}`)
            buttons.set(button.id, button)
        })
    })
    logInfo(`Loaded ${buttons.size} buttons`)
}