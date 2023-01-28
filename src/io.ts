import { readFile, writeFile } from "fs/promises";
import { parse as parseToml } from "toml";
import { join, resolve } from "path";

import { config } from "./config";

export async function readConfigFile() {
    const configStr = await readFile(process.cwd() + "/rss-config.toml", "utf-8");
    return parseToml(configStr);
}

export async function writeRssFile(content: string) {
    let path = resolve(config.out.outFileDir ?? config.out.outFile ?? "");
    if (!path.endsWith(".rss")) {
        path = join(path, "feed.rss");
    }

    writeFile(path, content);
}
