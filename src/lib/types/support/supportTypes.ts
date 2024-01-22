export const supportTypes = ['programming', 'media', 'modeling', 'mechanics', 'electronics', 'strategy', 'community', 'pr'] as const;
export type SupportType = typeof supportTypes[number];