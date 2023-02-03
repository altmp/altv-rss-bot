import type { NewsChannel, TextChannel, AnyThreadChannel, ForumChannel } from "discord.js";

import { FeedMessage } from "./generator/feed";
import { parseContent } from "./parser";

type Channel = NewsChannel | TextChannel | AnyThreadChannel<boolean> | ForumChannel;

// TODO: handle rate limits
export async function fetchAllChannelMessages(channel: Channel): Promise<FeedMessage[]> {
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
            parseContent(message.content),
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
                        parseContent(message.content),
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
