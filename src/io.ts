import { readFile, writeFile } from "node:fs/promises";
import { stat } from "node:fs/promises";

import { parse as parseToml } from "toml";
import { join, resolve } from "path";

import { type FeedType, FEED_TYPE } from "./generator/feed";
import { config } from "./config";

export async function assertPaths(): Promise<void> {
    // const dirPromises: Promise<Stats>[] = [];

    try {
        if (config.out.out_file_dir) {
            if (!(await stat(resolve(config.out.out_file_dir))).isDirectory()) {
                throw new Error(`folder not found at: ${config.out.out_file_dir}`);
            }
        }

        // if (config.out.limited_feed_out_file) {
        //     dirPromises.push(stat(resolve(config.out.limited_feed_out_file)));
        // }

        // if (config.out.full_feed_out_file) {
        //     dirPromises.push(stat(resolve(config.out.full_feed_out_file)));
        // }
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

export async function readConfigFile() {
    try {
        const tomlConfigPath = join(process.cwd(), "rss-config.toml");
        const configStr = await readFile(tomlConfigPath, "utf-8");
        return parseToml(configStr);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

export async function writeRssFile(feedType: FeedType[keyof FeedType], content: string) {
    const configOutFile =
        feedType === FEED_TYPE.FT_LIMITED
            ? config.out.limited_feed_out_file
            : config.out.full_feed_out_file;

    let path = resolve(config.out.out_file_dir ?? configOutFile ?? "");
    if (!path.endsWith(".rss")) {
        path = join(path, `${feedType.description}.rss`);
    }

    writeFile(path, content);
}
