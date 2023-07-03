export type FeedType = typeof FEED_TYPE;
export const FEED_TYPE = {
    LIMITED: 0,
    FULL: 1,
} as const;

export type FileDeclaration = typeof FILE_DECLARATION;
export const FILE_DECLARATION = {
    [FEED_TYPE.LIMITED]: "news-short.rss",
    [FEED_TYPE.FULL]: "news.rss",
} as const;
