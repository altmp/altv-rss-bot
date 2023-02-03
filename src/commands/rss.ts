import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { Feed } from "../generator/feed";

export const rssCommand = new SlashCommandBuilder()
    .setName("rss")
    .setDescription("Regenerates the rss file")
    .setDefaultMemberPermissions(0);

export async function rssAction(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
        setImmediate(() => {
            interaction.reply({
                content: "The rss file was succesfuly re-generated !",
                ephemeral: true,
            });
        });

        await Feed.generate();
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: "There was an error while executing this command!",
            ephemeral: true,
        });
    }
}
