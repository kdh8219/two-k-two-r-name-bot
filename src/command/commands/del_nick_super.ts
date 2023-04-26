import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
} from "discord.js";

import mojangAPI from "../../wrapper/mojang-api.js";
import firebase from "../../wrapper/firebase.js";

export default {
  data: new SlashCommandBuilder()
    .setName("del_nick_super")
    .setDescription("delete someone's nickname on the list")
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
    if (
      !(
        await members
          .where("minecraft_uuid", "==", mcuuid)
          .where("discord_id", "==", discord_id)
          .get()
      ).empty
    ) {
      let discord_tag;
      try {
        const discord_user = await interaction.client.users.fetch(discord_id);
        discord_tag = discord_user.tag;
      } catch {
        discord_tag = "Deleted User#0000";
      }
      interaction.editReply({
        content: `삭제 완료:${discord_tag}(${discord_id})에게서 ${mcid}(${mcuuid})를 제거했습니다.`,
      });
      return;
    } else {
      await interaction.editReply({
        content: `\`에러\`: 해당 계정이 없습니다.`,
      });
      return;
    }
  },
};
