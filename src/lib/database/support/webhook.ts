import { WebhookClient } from "discord.js";
import { getSupportWebhookURL } from "../../../config/config";

interface SupportWebhookPayload {
    threadName: string;
    content: string;
    username: string;
    avatarURL: string;
}

let webhookClient;

export function initSupportWebhookManager() {
    if (webhookClient) {
        return;
    }

    webhookClient = new WebhookClient({ url: getSupportWebhookURL() });
}

export async function createSupportThread(payload: SupportWebhookPayload): Promise<string | null> {
    if (!webhookClient) {
        if (!getSupportWebhookURL()) return null;
        else initSupportWebhookManager();
    }

    const message = await webhookClient.send(payload);

    return message.channel_id;
}