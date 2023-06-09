import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { Firestore } from "firebase-admin/firestore";

import { MojangAPI } from "./../wrapper/mojang-api.js";
import { send_embed } from "./send_embed.js";

export async function add_user(
  interaction: ChatInputCommandInteraction,
  discord_id: string,
  mcid: string,
  mojangAPI: MojangAPI,
  firebase: Firestore
) {
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
    await interaction.editReply({
      content: "`에러`: 해당 디스코드 아이디는 블랙리스트 되었습니다.",
    });
    return;
  }
  if (!(await blacklist.where("minecraft_uuid", "==", mcuuid).get()).empty) {
    await interaction.editReply({
      content: "`에러`: 해당 마인크래프트 계정은 블랙리스트 되었습니다.",
    });
    return;
  }
  if (!(await members.where("minecraft_uuid", "==", mcuuid).get()).empty) {
    await interaction.editReply({
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

  await send_embed(interaction.client, process.env.LOG_CHANNEL_ID, [
    new EmbedBuilder()
      .setTitle("User Added")
      .setColor(0x0099ff)
      .addFields([
        {
          name: "Command sender",
          value: `${interaction.user.tag}(${interaction.user.id})`,
        },
        { name: " ", value: " " },
        { name: "Discord Id", value: discord_id },
        { name: " ", value: " " },
        { name: "Minecraft Id", value: mcid },
        { name: "Minecraft Uuid", value: mcuuid },
      ])
      .setTimestamp(interaction.createdAt),
  ]);
}
