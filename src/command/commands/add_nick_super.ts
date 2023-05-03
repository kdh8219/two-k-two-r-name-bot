import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
} from "discord.js";

import mojangAPI from "../../wrapper/mojang-api.js";
import firebase from "../../wrapper/firebase.js";
import { add_user } from "../../functions.js";

export default {
  data: new SlashCommandBuilder()
    .setName("add_nick_super")
    .setDescription("Add ones nickname on the list and share it to 2k2rs")
    .addUserOption((option) =>
      option
        .setName("discord")
        .setDescription("discord account")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("minecraft_id")
        .setDescription("id of the minecraft account")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),
  async execute(interaction: ChatInputCommandInteraction) {
    const discord_id = interaction.options.getUser("discord")?.id as string;
    const mcid = interaction.options.getString("minecraft_id") as string;
    add_user(interaction, discord_id, mcid, mojangAPI, firebase);
  },
};
