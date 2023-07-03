import { config } from "./config";
import { rssBot } from "./bot";

import { toHTML } from "discord-markdown";
import { Attachment } from "discord.js";

const Regex = {
    R_ROLE: /(?<=\<span class="d-mention d-role">)(.*?)(?=<\/span>)/g,
    R_CHANNEL: /(?<=\<span class="d-mention d-channel">)(.*?)(?=<\/span>)/g,
    R_USER: /(?<=\<span class="d-mention d-user">)(.*?)(?=<\/span>)/g,
    R_TIMESTAMP: /&lt;t:(\d+)(?::([tTdDfFR]))?&gt;/g,
} as const;

function hexToRgb(hex: string) {
    return `${hex.match(/\w\w/g)?.map((x) => +`0x${x}`)}`;
}

function transform(regex: RegExp, content: string, callback: (id: string) => void) {
    const numbersOnly = /^[&#@][0-9]+$/;
    for (const target of content.matchAll(regex)) {
        const id = target[1]?.split(":")[1] ?? target[1];

        /**
         * Check so it doesnt react to <#lol> in a message for example
         * No id should be smaller than 17 digits (+ the #) since it represents
         * the number of milliseconds since January 1, 2015
         */
        if (id == null || id.match(numbersOnly) == null || id.length < 18) {
            continue;
        }

        callback(id);
    }
}

function transformImages(
    content: string,
    attachmentUrls: string[],
    attachments: IterableIterator<Attachment>
): string {
    let imgs = "";

    for (const url of attachmentUrls) {
        imgs += `<img alt="attachment" src="${url}">`;
    }

    for (const attachment of attachments) {
        if (["jpeg", "jpg", "png", "gif"].includes(attachment.url.split(".")?.at(-1) ?? "")) {
            imgs += `<img alt="${attachment.name}" src="${attachment.url}">`;
        }
    }

    if (imgs.length > 0) {
        content += `<span data-images>${imgs}</span>`;
    }

    return content;
}

export function parseContent(
    content: string,
    attachmentUrls: string[],
    attachments: IterableIterator<Attachment>
): string {
    const guild = rssBot.guilds.cache.get(config.discord.guild_id);
    if (!guild) {
        throw new Error(`No guild found for the id (${config.discord.guild_id})`);
    }

    content = toHTML(content);

    transform(Regex.R_CHANNEL, content, (id) => {
        const channel = rssBot.channels.cache.get(id.replace("#", ""));
        if (channel && !channel.isDMBased()) {
            content = content.replace(
                `<span class="d-mention d-channel">${id}</span>`,
                `<span data-mention>#${channel.name}</span>`
            );
        }
    });

    transform(Regex.R_USER, content, (id) => {
        const user = rssBot.users.cache.get(id.replace("@", ""));
        if (user) {
            content = content.replace(
                `<span class="d-mention d-user">${id}</span>`,
                `<span data-mention>@${user.username}</span>`
            );
        }
    });

    transform(Regex.R_ROLE, content, (id) => {
        const role = guild.roles.cache.get(id.replace("&", ""));
        if (role) {
            content = content.replace(
                `<span class="d-mention d-role">${id}</span>`,
                role.color > 0
                    ? `<span data-mention="${hexToRgb(role.hexColor)}">@${role.name}</span>`
                    : `<span data-mention>@${role.name}</span>`
            );
        }
    });

    content = content
        // set @everyone and @here as mentions
        .replace(/@everyone/g, "<span data-mention>@everyone</span>")
        .replace(/@here/g, "<span data-mention>@here</span>")

        // transform parsed "toHtml" classes to rss attributes
        .replace(/class="d-spoiler"/g, "data-spoiler")
        .replace(/class="d-emoji d-emoji-animated"/g, "data-emoji")
        .replace(/class="d-emoji"/g, "data-emoji")

        // transform timestamps
        .replace(
            /&lt;t:(?<timestamp>\d+)(?::(?<style>[tTdDfFR]))?&gt;/g,
            '<span data-timestamp="$<style>">$<timestamp></span>'
        );

    // transform images at the end of the content
    content = transformImages(content, attachmentUrls, attachments);

    return content;
}
