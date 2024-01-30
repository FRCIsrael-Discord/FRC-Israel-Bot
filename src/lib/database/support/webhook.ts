import { Client, Message, Webhook } from "discord.js";
import { getSupportWebhookURL } from "../../../config/config";
import { logError } from "../../../utils/logger";

interface WebhookPayload {
    content: string;
    username?: string;
    avatarURL?: string;
    threadName?: string;
    threadId?: string;
}

let webhook: Webhook | undefined;

export async function initWebhookManager(client: Client): Promise<boolean> {
    try {
        webhook = await client.fetchWebhook(getSupportWebhookURL());
        return true;
    } catch (err) {
        logError('Failed to fetch support webhook!');
        return false;
    }
}

export async function sendWebhookMessage(payload: WebhookPayload): Promise<Message | null> {
    if (!webhook) return null;

    const message = await webhook.send({
        ...payload,
        allowedMentions: { parse: ['users', 'roles'] }
    });

    return message;
}

export async function editWebhookMessage(messageId: string, payload: WebhookPayload): Promise<Message | null> {
    if (!webhook) return null;

    const message = await webhook.fetchMessage(messageId, payload);

    return await webhook.editMessage(message, {
        ...payload,
        allowedMentions: { parse: ['users', 'roles'] }
    });
}