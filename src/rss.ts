import { Feed, FEED_TYPE } from "./generator/feed";

// @ts-expect-error no types
import { s3upload } from "@altmp/upload-tool";
import { writeRssFile } from "./io";

export async function rssProcedure(): Promise<void> {
    console.log("Generating rss feeds..");
    const feeds = await Feed.generate();

    console.log("Generating rss files..");
    const paths = await Promise.all([
        writeRssFile(FEED_TYPE.FT_LIMITED, feeds[0]),
        writeRssFile(FEED_TYPE.FT_FULL, feeds[1])
    ]);

    console.log("Uploading rss files to alt:V CDN..");
    // await Promise.all([
    //     s3upload(paths[0], "rss/news-short.rss", null),
    //     s3upload(paths[1], "rss/news.rss", null),
    // ]);
}
