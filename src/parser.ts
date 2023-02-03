import { config } from "./config";
import { rssBot } from "./bot";

const Regex = Object.freeze({
    R_ROLE: /(?<=\<@&)(.*?)(?=\>)/g,
    R_CHANNEL: /(?<=\<#)(.*?)(?=\>)/g,
    R_USER: /(?<=\<@)(.*?)(?=\>)/g,
});

function hexToRgb(hex: string) {
    return `${hex.match(/\w\w/g)?.map((x) => +`0x${x}`)}`;
}

function transform(regex: RegExp, content: string, cb: (id: string) => void) {
    const numbersOnly = /^[0-9]*$/;
    for (const target of content.matchAll(regex)) {
        const id = target[1];

        // check so it doesnt react to <#lol> in a message for example
        if (id == null || id.match(numbersOnly) == null || id.length !== 18) {
            continue;
        }

        cb(id);
    }
}

export function parseContent(content: string): string {
    const guild = rssBot.guilds.cache.get(config.discord.guild_id);
    if (!guild) {
        throw new Error(`No guild found for the id (${config.discord.guild_id})`);
    }

    transform(Regex.R_ROLE, content, (id) => {
        const role = guild.roles.cache.get(id);
        if (role) {
            content = content.replace(
                role.toString(),
                `<span data-mention="${hexToRgb(role.hexColor)}">@${role.name}</span>`
            );
        }
    });

    transform(Regex.R_CHANNEL, content, (id) => {
        const channel = rssBot.channels.cache.get(id);
        if (channel && !channel.isDMBased()) {
            content = content.replace(
                channel.toString(),
                `<span data-mention>#${channel.name}</span>`
            );
        }
    });

    transform(Regex.R_USER, content, (id) => {
        const user = rssBot.users.cache.get(id);
        if (user) {
            content = content.replace(
                user.toString(),
                `<span data-mention>@${user.username}</span>`
            );
        }
    });

    return content;
}
