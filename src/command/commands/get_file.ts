import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";

import firebase from "../../wrapper/firebase.js";
import { TUser } from "../../types.js";

export default {
  data: new SlashCommandBuilder()
    .setName("get_file")
    .setDescription("get the file")
    .setDMPermission(false),
  async execute(interaction: ChatInputCommandInteraction) {
    const discord_id = interaction.user.id;

    const members = firebase.collection("members");
    const blacklist = firebase.collection("blacklist");

    if ((await members.where("discord_id", "==", discord_id).get()).empty) {
      await interaction.editReply({
        content: "`에러`: 하나 이상의 아이디를 등록해야 합니다.",
      });
      return;
    }

    let data: {
      blacklist: string[];
      members: string[];
    } = { blacklist: [], members: [] };
    (await blacklist.get()).forEach((doc) => {
      const user = doc.data() as TUser;
      data.blacklist.push(user.minecraft_uuid);
    });
    (await members.get()).forEach((doc) => {
      const user = doc.data() as TUser;
      data.members.push(user.minecraft_uuid);
    });

    const buffered_file = {
      attachment: Buffer.from(JSON.stringify(data)),
      name: "data.json",
    };
    await interaction.editReply({
      content: `*** 절대 이 파일을 공유하지 마세요***`,
      files: [buffered_file],
    });
  },
};
