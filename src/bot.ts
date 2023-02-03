import { REST, Client, GatewayIntentBits, Partials } from "discord.js";
import { config } from "./config";

export const rest = new REST({ version: "10" }).setToken(config.bot.token);
export const rssBot = new Client({
    partials: [Partials.Channel, Partials.Message],
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

rssBot.login(config.bot.token);
