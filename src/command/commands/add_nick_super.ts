import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  User,
} from "discord.js";

import mojangAPI from "../../wrapper/mojang-api.js";
import firebase from "../../wrapper/firebase.js";
import {
  check_user_type_by_discord_id,
  check_user_type_by_minecraft_uuid,
  EUserType,
  TData,
} from "../../functions.js";

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
    let data = (await firebase.get()).val() as TData;

    const discord_id = interaction.options.getUser("discord")?.id as string;
    const dcusertype = check_user_type_by_discord_id(data, discord_id);
    if (dcusertype == EUserType.Blacklisted) {
      interaction.editReply({
        content: "`에러`: 해당 디스코드 아이디는 블랙리스트 되었습니다.",
      });
      return;
    }

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
    const mcusertype = check_user_type_by_minecraft_uuid(data, mcuuid);

    if (mcusertype == EUserType.Blacklisted) {
      interaction.editReply({
        content: "`에러`: 해당 마인크래프트 아이디는 블랙리스트 되었습니다.",
      });
      return;
    } else if (mcusertype == EUserType.Member) {
      interaction.editReply({
        content: "`에러`: 해당 마인크래프트 아이디는 이미 등록되었습니다.",
      });
      return;
    }

    if (dcusertype == EUserType.Unregistered) {
      await interaction.editReply({
        content: `${mcid}(${mcuuid})님 2k2r에 오신것을 환영합니다!`,
      });
      data["members"].push({ discord: discord_id, minecraft: [mcuuid] });
    } else {
      for (let member of data.members) {
        if (member.discord == discord_id) {
          await interaction.editReply({
            content: `${mcid}(${mcuuid})이 성공적으로 부계정으로 등록되었습니다!`,
          });
          member.minecraft.push(mcuuid);
        }
      } //신규 디코일 경우
    }
    await firebase.set(data);
  },
};
