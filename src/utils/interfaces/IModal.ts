import { ModalSubmitInteraction } from "discord.js";
import { IBot } from "./IBot";

export interface IModal {
    id: string;
    catergory: string;
    deferReply: boolean;
    ephemeral: boolean;
    execute: (bot: IBot, interaction: ModalSubmitInteraction) => Promise<any>;
}