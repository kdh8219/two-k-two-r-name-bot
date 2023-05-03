import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";

import firebase from "../../wrapper/firebase.js";
import { TUser, embed_to_channel } from "../../functions.js";

export default {
  data: new SlashCommandBuilder()
    .setName("mov_blacklist_super")
    .setDescription("add user to blacklist")
    .addUserOption((option) =>
      option
        .setName("discord")
        .setDescription("discord id of blacklister")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),
  async execute(interaction: ChatInputCommandInteraction) {
    const discord_id = interaction.options.getUser("discord_id").id;
    const blacklist = firebase.collection("blacklist");
    const members = firebase.collection("members");
    const target = await members.where("discord_id", "==", discord_id).get();
    if (target.empty) {
      await interaction.editReply({
        content: "`에러`:해당 discord id로 등록된 유저를 찾을 수 없었어요",
      });
      return;
    }

    const target_data: TUser[] = [];
    target.forEach((doc) => {
      target_data.push(doc.data() as TUser);
      members.doc(doc.id).delete();
    });
    target_data.forEach((user) => {
      blacklist.add(user);
    });

    await interaction.editReply({
      content: "성공적으로 해당 discord id와 minecraft id를 블랙리스팅 했어요.",
    });

    let UUIDs: string;
    target_data
      .map((user) => {
        user.discord_id;
      })
      .map((uuid) => {
        UUIDs += uuid;
        UUIDs += "\n";
      });
    const embed = new EmbedBuilder()
      .setTitle("User deleted")
      .setColor(0x0099ff)
      .setFields([
        {
          name: "Command sender",
          value: `${interaction.user.tag}(${interaction.user.id})`,
        },
        { name: " ", value: " " },
        { name: "Target Discord Id", value: discord_id },
        { name: "UUIDs", value: UUIDs },
      ])
      .setTimestamp(interaction.createdAt);
    await embed_to_channel(
      interaction.client,
      process.env.LOG_CHANNEL_ID,
      embed
    );
  },
};
