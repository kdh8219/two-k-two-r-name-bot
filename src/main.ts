import { Client, EmbedBuilder, Events, GatewayIntentBits } from "discord.js";
import { config } from "dotenv";
config();

import { getCommands } from "./command/commands.js";
import mojangAPI from "./wrapper/mojang-api.js";
import { TUser } from "./types.js";
import firebase from "./wrapper/firebase.js";
import { send_embed } from "./functions/send_embed.js";

await mojangAPI.load_cache_from_firestore();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const commandCollection = getCommands();
export let onTime: Date;

client.once(Events.ClientReady, async (event) => {
  console.log(`[DISCORD] Ready: discord client as ${event.user.tag}`);
  onTime = new Date();

  const guild = await client.guilds.fetch(process.env.DISCORD_TARGET_GUILD_ID);
  {
    const members_collection = firebase.collection("members");
    const members = await members_collection.get();
    for (const doc of members.docs) {
      const data = doc.data() as TUser;
      try {
        await guild.members.fetch(data.discord_id);
      } catch {
        doc.ref.delete();
        await send_embed(client, process.env.LOG_CHANNEL_ID, [
          new EmbedBuilder()
            .setTitle("Auto Removed")
            .setColor(0x0099ff)
            .setFields([
              { name: "Discord Id", value: data.discord_id },
              { name: "Minecraft Uuid", value: data.minecraft_uuid },
            ])
            .setTimestamp(new Date()),
        ]);
      }
    }
  }
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
    await send_embed(client, process.env.LOG_CHANNEL_ID, [
      new EmbedBuilder()
        .setTitle("Auto Removed")
        .setColor(0x0099ff)
        .setFields([
          { name: "Discord Id", value: data.discord_id },
          { name: "Minecraft Uuid", value: data.minecraft_uuid },
        ])
        .setTimestamp(new Date()),
    ]);
  }
});

await client.login(process.env.DISCORD_TOKEN);
