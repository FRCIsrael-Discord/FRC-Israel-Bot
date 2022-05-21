import * as fs from 'fs';

export function getFiles(path: string, ending: string): string[] {
    return fs.readdirSync(path).filter(file => file.endsWith(ending));
}