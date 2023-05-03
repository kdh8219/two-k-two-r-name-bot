import { Client, Events, GatewayIntentBits } from "discord.js";
import { config } from "dotenv";
config();

import { getCommands } from "./command/commands.js";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const commandCollection = getCommands();
export let onTime: Date;

client.once(Events.ClientReady, (event) => {
  console.log(`[DISCORD] Ready: discord client as ${event.user.tag}`);
  onTime = new Date();
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = commandCollection.get(interaction.commandName);
  if (interaction.commandName !== "ping") {
    await interaction.deferReply({ ephemeral: true });
  }

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    try {
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    } catch (e) {
      await interaction.editReply({
        content: "There was an error while executing this command!",
      });
      console.error(e);
    }
  }
});

await client.login(process.env.DISCORD_TOKEN);
