import { type FeedType, FEED_TYPE, FILE_DECLARATION } from "../consts";
import type { FeedMessage } from "./structs/FeedMessage";

import { Feed } from "./structs/Feed";
import { config } from "../config";

export async function generateRssFeed(type: FeedType[keyof FeedType], messages: FeedMessage[]): Promise<string> {
    const fileDeclaration = FILE_DECLARATION[type];
    const date = new Date();

    const feed = new Feed({
        title: "",
        id: `https://cdn.altv.mp/rss/${fileDeclaration}`,
        link: `https://cdn.altv.mp/rss/${fileDeclaration}`,
        language: "en",
        copyright: `All right reserved ${date.getFullYear()}, alt:MP`,
        updated: date,
    });

    for (let i = 0, l = messages.length; i < l; i++) {
        const message = messages[i]!;

        if (type !== FEED_TYPE.LIMITED) {
            message.addItem(feed);
            continue;
        }

        if (config.out.rss_items_limit >= i + 1) {
            message.addItem(feed);
        }
    }

    return feed.rss2();
}
