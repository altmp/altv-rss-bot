import type { NewsChannel, TextChannel, AnyThreadChannel, ForumChannel, Message } from "discord.js";
import { ChannelType } from "discord.js";

import { FeedMessage } from "./generator/feed";
import { parseContent } from "./parser";
import { config } from "./config";
import { rssBot } from "./bot";

type Channel = NewsChannel | TextChannel | AnyThreadChannel<boolean> | ForumChannel;

function getAttachmentsFromEmbed(message: Message<true>): string[] {
    const embedAttachments: string[] = [];

    message.embeds.forEach((embed) => {
        // ref: https://discord.com/developers/docs/resources/channel#embed-object-embed-types
        if (embed.data.type === "image" || embed.data.type === "gifv") {
            embedAttachments.push(embed.data.url!);
        }
    });

    return embedAttachments;
}

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

    console.log(message.embeds);
    buffer.push(
        new FeedMessage(
            channel.name,
            message.id,
            message.url,
            parseContent(
                message.content,
                // TODO: make it uniform
                getAttachmentsFromEmbed(message),
                message.attachments.values()
            ),
            message.createdAt,
            Boolean(message.editedAt)
        )
    );

    while (message) {
        await channel.messages.fetch({ limit: 100, before: message.id }).then((page) => {
            page.forEach((message) => {
                const embedAttachments: string[] = [];
                message.embeds.forEach((embed) => {
                    // ref: https://discord.com/developers/docs/resources/channel#embed-object-embed-types
                    if (embed.data.type === "image" || embed.data.type === "gifv") {
                        embedAttachments.push(embed.data.url!);
                    }
                });

                buffer.push(
                    new FeedMessage(
                        channel.name,
                        message.id,
                        message.url,
                        parseContent(
                            message.content,
                            // TODO: make it uniform
                            getAttachmentsFromEmbed(message),
                            message.attachments.values()
                        ),
                        message.createdAt,
                        Boolean(message.editedAt)
                    )
                );
            });
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
