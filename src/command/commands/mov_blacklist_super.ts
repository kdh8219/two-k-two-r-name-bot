import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
} from "discord.js";

import firebase from "../../wrapper/firebase.js";
import { TUser } from "../../functions.js";

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
  },
};
