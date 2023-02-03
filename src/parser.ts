import { config } from "./config";
import { rssBot } from "./bot";

import { toHTML } from "discord-markdown";
import { Attachment } from "discord.js";

const Regex = Object.freeze({
    R_ROLE: /(?<=\<span class="d-mention d-role">)(.*?)(?=<\/span>)/g,
    R_CHANNEL: /(?<=\<span class="d-mention d-channel">)(.*?)(?=<\/span>)/g,
    R_USER: /(?<=\<span class="d-mention d-user">)(.*?)(?=<\/span>)/g,
    R_TIMESTAMP: /(?<=\&lt;t:)(.*?)(?=:F&gt;)/g,
});

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

export function parseContent(content: string, attachments: IterableIterator<Attachment>): string {
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
                `<span data-mention="${hexToRgb(role.hexColor)}">@${role.name}</span>`
            );
        }
    });

    for (const target of content.matchAll(Regex.R_TIMESTAMP)) {
        const timestamp = target[1];
        if (target.input && timestamp) {
            content = content.replaceAll(
                target.input,
                `<span data-timestamp='T'>${timestamp}</span>`
            );
        }
    }

    content = content.replaceAll('<span class="d-spoiler"', "<span data-spoiler");
    content = content.replaceAll('<img class="d-emoji d-emoji-animated"', "<img data-emoji");
    content = content.replaceAll('<img class="d-emoji"', "<img data-emoji");

    let imgs = "";
    for (const attachment of attachments) {
        imgs += `<img alt="${attachment.name}" src="${attachment.url}">`;
    }

    if (imgs.length > 0) {
        content += `<span data-images>${imgs}</span>`;
    }

    return content;
}
