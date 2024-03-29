import 'dotenv/config'

import { generateRssFeed } from "./rss-generator/generate";
import { getChannelsMessages } from "./discord/helpers";
import { FEED_TYPE, FILE_DECLARATION } from "./consts";

// @ts-expect-error no types
import { s3upload, purgeCache } from "@altmp/upload-tool";
import { writeRssFile } from "./io";

export async function rssProcedure(): Promise<void> {
    const messages = await getChannelsMessages();

    console.log("Generating rss feeds ...");
    const feeds = await Promise.all([
        generateRssFeed(FEED_TYPE.LIMITED, messages),
        generateRssFeed(FEED_TYPE.FULL, messages)
    ]);

    console.log("Generating rss files ...");
    const paths = await Promise.all([
        writeRssFile(FEED_TYPE.LIMITED, feeds[0]),
        writeRssFile(FEED_TYPE.FULL, feeds[1])
    ]);

    if (process.env['AWS_SECRET_ACCESS_KEY']) {
        console.log("Uploading rss files to S3 Storage ...");
        await Promise.all([
            s3upload(paths[0], `rss/${FILE_DECLARATION[0]}`, null),
            s3upload(paths[1], `rss/${FILE_DECLARATION[1]}`, null),
        ]);
    }

    if (process.env['CF_CACHE_PURGE_TOKEN']) {
        console.log("Purging Cloudflare Cache ...");
        await Promise.all([
            purgeCache(paths[0], `rss/${FILE_DECLARATION[0]}`, null),
            purgeCache(paths[1], `rss/${FILE_DECLARATION[1]}`, null),
        ]);
    }
}
