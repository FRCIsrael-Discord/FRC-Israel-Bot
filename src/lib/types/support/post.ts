import { SupportType } from "./supportTypes";

export interface SupportPost {
    channelId: string;
    type: SupportType;
    authorId: string;
    approved: boolean;
}