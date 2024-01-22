import { getSupportCooldown } from '../../config/config';

const cooldownTimers: {
    userId: string;
    timestamp: number;
}[] = []

export function getTimeLeft(userId: string): number {
    const timer = cooldownTimers.find(timer => timer.userId === userId);
    if (!timer) return 0;
    return timer.timestamp - Date.now();
}

export function addCooldown(userId: string) {
    const cooldownTime = getSupportCooldown() || 0;

    cooldownTimers.push({
        userId,
        timestamp: Date.now() + cooldownTime * 1000
    })
    setTimeout(() => {
        const index = cooldownTimers.findIndex(timer => timer.userId === userId);
        if (index !== -1) cooldownTimers.splice(index, 1);
    }, cooldownTime * 1000);
}