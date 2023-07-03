import type * as rss from "../types";
import { renderRSS } from "../rss2";

/**
 * Class used to generate Feeds
 */
export class Feed {
    options: rss.FeedOptions;
    items: rss.Item[] = [];
    categories: string[] = [];
    contributors: rss.Author[] = [];
    extensions: rss.Extension[] = [];

    constructor(options: rss.FeedOptions) {
        this.options = options;
    }

    /**
     * Add a feed item
     * @param item
     */
    public addItem = (item: rss.Item) => this.items.push(item);

    /**
     * Add a category
     * @param category
     */
    public addCategory = (category: string) => this.categories.push(category);

    /**
     * Add a contributor
     * @param contributor
     */
    public addContributor = (contributor: rss.Author) => this.contributors.push(contributor);

    /**
     * Adds an extension
     * @param extension
     */
    public addExtension = (extension: rss.Extension) => this.extensions.push(extension);

    /**
     * Returns a RSS 2.0 feed
     */
    public rss2 = (): string => renderRSS(this);
}
