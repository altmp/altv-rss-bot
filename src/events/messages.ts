import { type PartialMessage, Message } from "discord.js";

import { rssProcedure } from "../rss";
import { config } from "../config";
import { rssBot } from "../bot";

function filterMessage(message: Message | PartialMessage): void {
    if (message.author?.bot || message.author?.id === rssBot.user?.id) {
        return;
    }

    if (!config.discord.channels.includes(message.channelId)) {
        return;
    }

    rssProcedure();
}

rssBot.on("messageCreate", filterMessage);
rssBot.on("messageDelete", filterMessage);
rssBot.on("messageUpdate", (_oldMessage, newMessage) => {
    filterMessage(newMessage);
});
