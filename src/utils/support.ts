const cooldownTimers: {
    userId: string;
    timestamp: number;
}[] = []

const cooldownTime = 5 * 60 * 1000; // 5 minutes

export function getTimeLeft(userId: string): number {
    const timer = cooldownTimers.find(timer => timer.userId === userId);
    if (!timer) return 0;
    return timer.timestamp - Date.now();
}

export function setCooldown(userId: string) {
    cooldownTimers.push({
        userId,
        timestamp: Date.now() + cooldownTime
    })
    setTimeout(() => {
        const index = cooldownTimers.findIndex(timer => timer.userId === userId);
        if (index !== -1) cooldownTimers.splice(index, 1);
    }, cooldownTime);
}