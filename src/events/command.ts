import { commands } from "../commands";
import { rssBot } from "../bot";

rssBot.on("interactionCreate", (interaction) => {
    if (!interaction.isChatInputCommand()) {
        return;
    }

    const command = commands.get(interaction.commandName);
    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        command.action(interaction);
    } catch (error) {
        console.error(error);
        interaction.reply({
            content: "There was an error while executing this command!",
            ephemeral: true,
        });
    }
});
