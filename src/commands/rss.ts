import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { rssProcedure } from "../rss.js";

export const rssCommand = new SlashCommandBuilder()
    .setName("rss")
    .setDescription("Generate and upload the rss files")
    .setDefaultMemberPermissions(0);

export async function rssAction(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
        await interaction.reply({
            content: "The rss procedure started..",
            ephemeral: true,
        });
    } catch (error) {
        console.error(error);
        interaction.reply({
            content: "There was an error while executing this command !",
            ephemeral: true,
        });
    }

    try {
        await rssProcedure();
        await interaction.editReply({
            content: "The rss files are succesfuly generated and uploaded !",
        });
    } catch (error) {
        console.error(error);
        interaction.editReply({
            content: "An error occured during the rss procedure..",
        });
    }
}
