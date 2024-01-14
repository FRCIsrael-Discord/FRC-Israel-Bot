export const supportTypes = ['programming', 'media', 'modeling', 'mechanics', 'electronics', 'strategy', 'community', 'pr'] as const;
export const forumSupportLabels = {
    programming: 'תכנות',
    media: 'מדיה',
    modeling: 'מידול',
    mechanics: 'מכניקה',
    electronics: 'אלקטרוניקה',
    strategy: 'אסטרטגיה',
    community: 'קהילה',
    pr: 'יחסי ציבור'
} as const;
export type SupportType = typeof supportTypes[number];