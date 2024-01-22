import { SupportType } from "./supportTypes";

export interface SupportPost {
    channelId: string;
    title: string;
    question: string;
    type: SupportType;
    authorId: string;
    approved: boolean;
}