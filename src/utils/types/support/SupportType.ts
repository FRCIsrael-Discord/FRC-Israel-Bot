export const supportTypes = ['programming', 'media', 'modeling', 'electronics', 'strategy', 'community', 'pr'] as const;
export const forumSupportLabels = {
    programming: 'תכנות',
    media: 'מדיה',
    modeling: 'מידול',
    electronics: 'אלקטרוניקה',
    strategy: 'אסטרטגיה',
    community: 'קהילה',
    pr: 'יחסי ציבור'
} as const;
export type SupportType = typeof supportTypes[number];