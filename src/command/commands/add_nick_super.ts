import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
} from "discord.js";

import mojangAPI from "../../wrapper/mojang-api.js";
import firebase from "../../wrapper/firebase.js";

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
    let mcuuid: string;
    try {
      mcuuid = await mojangAPI.getUUIDFromId(mcid);
    } catch {
      await interaction.editReply({
        content:
          "`에러`: 마인크래프트 닉네임 검색을 실패했습니다. 마인크래프트 닉네임을 정확하게 입력했나요?",
      });
      return;
    }

    const members = firebase.collection("members");
    const blacklist = firebase.collection("blacklist");

    if (!(await blacklist.where("discord_id", "==", discord_id).get()).empty) {
      interaction.editReply({
        content: "`에러`: 해당 디스코드 아이디는 블랙리스트 되었습니다.",
      });
      return;
    }
    if (!(await blacklist.where("minecraft_uuid", "==", mcuuid).get()).empty) {
      interaction.editReply({
        content: "`에러`: 해당 마인크래프트 계정은 블랙리스트 되었습니다.",
      });
      return;
    }
    if (!(await members.where("minecraft_uuid", "==", mcuuid).get()).empty) {
      interaction.editReply({
        content: "`에러`: 해당 마인크래프트 아이디는 이미 등록되었습니다.",
      });
      return;
    }

    if ((await members.where("discord_id", "==", discord_id).get()).empty) {
      await interaction.editReply({
        content: `${mcid}(${mcuuid})님 2k2r에 오신것을 환영합니다!`,
      });
    } else {
      await interaction.editReply({
        content: `${mcid}(${mcuuid})이 성공적으로 부계정으로 등록되었습니다!`,
      });
    }
    await members.add({
      discord_id,
      minecraft_uuid: mcuuid,
    });
  },
};
