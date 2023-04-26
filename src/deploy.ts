import { REST, Routes } from "discord.js";
import { config } from "dotenv";
config();

import { getCommands } from "./functions";

const commands = getCommands();
// Construct and prepare an instance of the REST module
const rest = new REST({ version: "10" }).setToken(
  process.env.DISCORD_TOKEN as string
);

// and deploy your commands!
(async () => {
  try {
    console.log(`Started refreshing all application (/) commands.`);

    // The put method is used to fully refresh all commands in the guild with the current set
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.discord_CLIENT_ID as string,
        process.env.discord_GUILD_ID as string
      ),
      { body: commands }
    );

    console.log(`Successfully reloaded all application (/) commands.`);
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
})();
