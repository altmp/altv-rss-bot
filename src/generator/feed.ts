import type { Author, Extension, FeedOptions, Item } from "./types";
import { renderRSS } from "./rss2";

import { getChannelsMessages } from "../discord";
import { writeRssFile } from "../io";
import { config } from "../config";

export * from "./types";

export class FeedMessage {
    constructor(
        readonly channelName: string,
        readonly id: string,
        readonly url: string,
        readonly content: string,
        readonly createdAt: Date,
        readonly edited: boolean
    ) {}

    addItem(feed: Feed): void {
        feed.addItem({
            title: "",
            id: this.id,
            link: this.url,
            date: this.createdAt,
            description: this.content,
            author: [
                {
                    name: this.edited
                        ? `<span data-localized="#${this.channelName}">IN_CHANNEL</span> &#183; <span data-localized="EDITED">`
                        : `<span data-localized="#${this.channelName}">IN_CHANNEL</span>`,
                },
            ],
        });
    }
}

export type FeedType = typeof FEED_TYPE;
export const FEED_TYPE = Object.freeze({
    FT_LIMITED: Symbol("limited-feed"),
    FT_FULL: Symbol("full-feed"),
});

/**
 * Class used to generate Feeds
 */
export class Feed {
    static async generate(): Promise<void> {
        // TODO: different url for limited type feed
        const limitedFeed = new Feed({
            title: "",
            id: "https://cdn.altv.mp/rss/news.rss",
            link: "https://cdn.altv.mp/rss/news.rss",
            language: "en",
            copyright: "All right reserved 2023, alt:MP",
            updated: new Date(),
        });

        const fullFeed = new Feed({
            title: "",
            id: "https://cdn.altv.mp/rss/news.rss",
            link: "https://cdn.altv.mp/rss/news.rss",
            language: "en",
            copyright: "All right reserved 2023, alt:MP",
            updated: new Date(),
        });

        const messages = await getChannelsMessages();
        const sortedMessages = messages.sort(
            (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        );

        for (let i = 0, l = sortedMessages.length; i < l; i++) {
            const message = sortedMessages[i]!;

            if (config.out.rss_items_limit >= i + 1) {
                message.addItem(limitedFeed);
            }

            message.addItem(fullFeed);
        }

        writeRssFile(FEED_TYPE.FT_LIMITED, limitedFeed.rss2());
        writeRssFile(FEED_TYPE.FT_FULL, fullFeed.rss2());
        console.log(`Generating rss files..`);
    }

    options: FeedOptions;
    items: Item[] = [];
    categories: string[] = [];
    contributors: Author[] = [];
    extensions: Extension[] = [];

    constructor(options: FeedOptions) {
        this.options = options;
    }

    /**
     * Add a feed item
     * @param item
     */
    public addItem = (item: Item) => this.items.push(item);

    /**
     * Add a category
     * @param category
     */
    public addCategory = (category: string) => this.categories.push(category);

    /**
     * Add a contributor
     * @param contributor
     */
    public addContributor = (contributor: Author) => this.contributors.push(contributor);

    /**
     * Adds an extension
     * @param extension
     */
    public addExtension = (extension: Extension) => this.extensions.push(extension);

    /**
     * Returns a RSS 2.0 feed
     */
    public rss2 = (): string => renderRSS(this);
}
