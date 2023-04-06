import { ButtonInteraction } from "discord.js";
import { IBot } from "./IBot";

export interface IButton {
    id: string;
    catergory: string;
    deferReply: boolean;
    ephemeral: boolean;
    execute: (bot: IBot, interaction: ButtonInteraction) => Promise<any>;
}