import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { Feed } from "../generator/feed";

export const rssCommand = new SlashCommandBuilder().setName("ping").setDescription("lol");

export async function rssAction(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
        await Feed.generate();
        interaction.reply({
            content: "The rss file was succesfuly re-generated !",
            ephemeral: true,
        });
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: "There was an error while executing this command!",
            ephemeral: true,
        });
    }
}
