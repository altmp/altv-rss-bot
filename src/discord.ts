import type { NewsChannel, TextChannel, AnyThreadChannel, ForumChannel } from "discord.js";
import { ChannelType } from "discord.js";

import { FeedMessage } from "./generator/feed";
import { parseContent } from "./parser";
import { config } from "./config";
import { rssBot } from "./bot";

type Channel = NewsChannel | TextChannel | AnyThreadChannel<boolean> | ForumChannel;

// TODO: handle rate limits
async function fetchAllChannelMessages(channel: Channel): Promise<FeedMessage[]> {
    const buffer: FeedMessage[] = [];

    let message = await channel.messages
        .fetch({ limit: 1 })
        .then((page) => (page.size === 1 ? page.at(0) : null));

    if (!message) {
        console.warn(`No message found in the channel ${channel.id}`);
        return buffer;
    }

    buffer.push(
        new FeedMessage(
            channel.name,
            message.id,
            message.url,
            parseContent(message.content, message.attachments.values()),
            message.createdAt,
            Boolean(message.editedAt)
        )
    );

    while (message) {
        await channel.messages.fetch({ limit: 100, before: message.id }).then((page) => {
            page.forEach((message) =>
                buffer.push(
                    new FeedMessage(
                        channel.name,
                        message.id,
                        message.url,
                        parseContent(message.content, message.attachments.values()),
                        message.createdAt,
                        Boolean(message.editedAt)
                    )
                )
            );
            message = 0 < page.size ? page.at(page.size - 1) : null;
        });
    }

    return buffer;
}

export async function getChannelsMessages() {
    const buffer: FeedMessage[] = [];

    for (let i = 0, l = config.discord.channels.length; i < l; i++) {
        const channelId = config.discord.channels[i] as string;
        const channel = rssBot.channels.cache.get(channelId);

        if (
            !channel ||
            channel.type === ChannelType.GuildCategory ||
            channel.isVoiceBased() ||
            channel.isDMBased()
        ) {
            console.log(`Wrong channel type (id ${channelId}), skipped`);
            continue;
        }

        console.log(`[${i + 1}/${l}] Fetching messages...`);

        // No parallelizing on purpose to reduce rate limiting
        buffer.push(...(await fetchAllChannelMessages(channel)));
    }

    return buffer;
}
