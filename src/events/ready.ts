import { Routes } from "discord.js";

import { commands } from "../commands";
import { rssBot, rest } from "../bot";
import { config } from "../config";

rssBot.on("ready", async () => {
    try {
        console.log("Commands setup..");
        await rest.put(
            Routes.applicationGuildCommands(config.bot.application_id, config.discord.guild_id),
            {
                body: [...commands.values()].map((c) => c.command),
            }
        );

        console.log(`alt:V rss bot is online !`);
    } catch (error) {
        console.error(error);
    }
});
