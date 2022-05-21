import { IBot } from "./IBot";

export interface IEvent {
    name: string;
    once: boolean;
    execute(bot: IBot, ...args: any[]): Promise<any>;
}