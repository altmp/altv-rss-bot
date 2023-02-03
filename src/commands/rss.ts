import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { Feed } from "../generator/feed";

export const rssCommand = new SlashCommandBuilder()
    .setName("rss")
    .setDescription("Regenerates the rss file")
    .setDefaultMemberPermissions(0);

export async function rssAction(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
        await interaction.reply({
            content: "The rss file is generating..",
            ephemeral: true,
        });
    } catch (error) {
        console.error(error);
        interaction.reply({
            content: "There was an error while executing this command!",
            ephemeral: true,
        });
    }

    try {
        await Feed.generate();
        await interaction.editReply({
            content: "The rss file was succesfuly generated !",
        });
    } catch (error) {
        console.error(error);
        interaction.editReply({
            content: "An error occured during the file generation..",
        });
    }
}
