import 'dotenv/config'

export const config = {
    bot: {
        application_id: process.env["DISCORD_BOT_APPLICATION_ID"] ?? "",
        token: process.env["DISCORD_BOT_APPLICATION_TOKEN"] ?? "",
    },
    discord: {
        guild_id: process.env["DISCORD_GUILD_ID"] ?? "",
        channels: process.env["DISCORD_CHANNELS"]?.split(",") ?? [],
    },
    out: {
        rss_items_limit: Number(process.env["RSS_ITEMS_LIMIT"] ?? 10),
        out_file_dir: process.env["OUT_FILE_DIR"] ?? undefined,
        limited_feed_out_file: process.env["LIMITED_FEED_OUT_FILE"] ?? undefined,
        full_feed_out_file: process.env["FULL_FEED_OUT_FILE"] ?? undefined,
    },
}
