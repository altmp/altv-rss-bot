import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { rssCommand, rssAction } from "./rss";

export const commands = new Map<
    string,
    { command: SlashCommandBuilder; action: (interaction: ChatInputCommandInteraction) => void }
>();

commands.set(rssCommand.name, { command: rssCommand, action: rssAction });
