import { NewsChannel, TextChannel } from "discord.js";

import type { Author, Extension, FeedOptions, Item } from "./types";
import { renderRSS } from "./rss2";

import { fetchAllChannelMessages } from "../discord";
import { writeRssFile } from "../io";
import { config } from "../config";
import { rssBot } from "../bot";

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
                        ? `<span data-localized="IN_CHANNEL">#${this.channelName}</span> · <span data-localized="EDITED">`
                        : `<span data-localized="IN_CHANNEL">#${this.channelName}</span>`,
                },
            ],
        });
    }
}

/**
 * Class used to generate Feeds
 */
export class Feed {
    static async generate(): Promise<void> {
        const buffer: FeedMessage[] = [];

        for (let i = 0, l = config.discord.channels.length; i < l; i++) {
            const channelId = config.discord.channels[i] as string;
            const channel = rssBot.channels.cache.get(channelId);

            console.log(`[${i + 1}/${l}] Fetching messages...`);

            // No parallelizing on purpose to reduce rate limiting
            buffer.push(...(await fetchAllChannelMessages(channel)));
        }

        const feed = new Feed({
            title: "",
            id: "https://cdn.altv.mp/rss/news.rss",
            link: "https://cdn.altv.mp/rss/news.rss",
            language: "en",
            copyright: "All right reserved 2023, alt:MP",
            updated: new Date(),
        });

        for (const feedMessage of buffer.sort(
            (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        )) {
            feedMessage.addItem(feed);
        }

        writeRssFile(feed.rss2());
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
