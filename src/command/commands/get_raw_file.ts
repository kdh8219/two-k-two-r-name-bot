import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits,
} from "discord.js";

import firebase from "../../wrapper/firebase.js";
import { TUser } from "../../functions.js";

export default {
  data: new SlashCommandBuilder()
    .setName("get_raw_file")
    .setDescription("get the file")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),
  async execute(interaction: ChatInputCommandInteraction) {
    const discord_id = interaction.user.id;

    const members = firebase.collection("members");
    const blacklist = firebase.collection("blacklist");

    if ((await members.where("discord_id", "==", discord_id).get()).empty) {
      interaction.editReply({
        content: "`에러`: 하나 이상의 아이디를 등록해야 합니다.",
      });
      return;
    }

    let blacklist_data: Map<string, string[]> = new Map();
    (await blacklist.get()).forEach((doc) => {
      const user = doc.data() as TUser;
      const data_get = blacklist_data.get(user.discord_id);
      if (!data_get) {
        blacklist_data.set(user.discord_id, [user.minecraft_uuid]);
      } else {
        data_get.push(user.minecraft_uuid);
        blacklist_data.set(user.discord_id, data_get);
      }
    });

    let member_data: Map<string, string[]> = new Map();
    (await members.get()).forEach((doc) => {
      const user = doc.data() as TUser;
      const data_get = member_data.get(user.discord_id);
      if (!data_get) {
        member_data.set(user.discord_id, [user.minecraft_uuid]);
      } else {
        data_get.push(user.minecraft_uuid);
        member_data.set(user.discord_id, data_get);
      }
    });

    const file_like = {
      blacklist: Object.fromEntries(blacklist_data),
      members: Object.fromEntries(member_data),
    };

    const buffer_file = {
      attachment: Buffer.from(JSON.stringify(file_like)),
      name: "raw_file.txt",
    };
    await interaction.editReply({ files: [buffer_file] });
  },
};
