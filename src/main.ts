import { Client, EmbedBuilder, Events, GatewayIntentBits } from "discord.js";
import { config } from "dotenv";
config();

import { getCommands } from "./command/commands.js";
import mojangAPI from "./wrapper/mojang-api.js";
import {
  TUser,
  delete_members_who_left,
  embed_to_channel,
} from "./functions.js";
import firebase from "./wrapper/firebase.js";

await mojangAPI.load_cache_from_firestore();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const commandCollection = getCommands();
export let onTime: Date;

client.once(Events.ClientReady, async (event) => {
  console.log(`[DISCORD] Ready: discord client as ${event.user.tag}`);
  onTime = new Date();

  delete_members_who_left(
    client,
    await client.guilds.fetch(process.env.DISCORD_TARGET_GUILD_ID)
  );
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
    } catch {
      await interaction.editReply({
        content: "There was an error while executing this command!",
      });
    }
  }
});

client.on(Events.GuildMemberRemove, async (interaction) => {
  const exited_user = await firebase
    .collection("members")
    .where("discord_id", "==", interaction.user.id)
    .get();
  for (const doc of exited_user.docs) {
    const data = doc.data() as TUser;
    doc.ref.delete();
    const embed = new EmbedBuilder()
      .setTitle("물갈이")
      .setColor(0x0099ff)
      .setFields([
        { name: "Discord Id", value: data.discord_id },
        { name: "Minecraft Uuid", value: data.minecraft_uuid },
      ])
      .setTimestamp(new Date());
    await embed_to_channel(client, process.env.LOG_CHANNEL_ID, embed);
  }
});

await client.login(process.env.DISCORD_TOKEN);
