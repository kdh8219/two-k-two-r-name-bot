import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import mojangAPI from "../../wrapper/mojang-api.js";
import firebase from "../../wrapper/firebase.js";
import { add_user } from "../../functions/add_user.js";

export default {
  data: new SlashCommandBuilder()
    .setName("add_nick")
    .setDescription("Add your nickname on the list and share it to 2k2rs")
    .addStringOption((option) =>
      option
        .setName("minecraft_id")
        .setDescription("id of the minecraft account")
        .setRequired(true)
    )
    .setDMPermission(false),
  async execute(interaction: ChatInputCommandInteraction) {
    const discord_id = interaction.user.id;
    const mcid = interaction.options.getString("minecraft_id") as string;
    await add_user(interaction, discord_id, mcid, mojangAPI, firebase);
  },
};
