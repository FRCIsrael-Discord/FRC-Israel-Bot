import { Bot } from './bot';

export interface Event {
    name: string;
    once: boolean;
    execute(bot: Bot, ...args: any[]): Promise<any>;
}