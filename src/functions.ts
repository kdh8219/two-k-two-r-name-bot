import {
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
  Guild,
} from "discord.js";
import { Firestore } from "firebase-admin/firestore";

import { MojangAPI } from "./wrapper/mojang-api.js";
import firebase from "./wrapper/firebase.js";

export type TUser = {
  discord_id: string; // id
  minecraft_uuid: string; //uuid
};
export function dmSlice(raw: string): string[] {
  const output: string[] = [];
  function slasher(txt: string): { front: string; end: string } {
    if (txt.length <= 2000) {
      return {
        front: txt,
        end: null,
      };
    }
    let front = txt.slice(0, 2000);
    let end = txt.slice(2000, txt.length);
    if (end) {
      let toLastNextLine = front.slice(front.lastIndexOf("\n"), front.length);
      front = front.slice(0, front.lastIndexOf("\n"));
      end = toLastNextLine + end;
      if (end.slice(0, 1) == "\n") {
        end = "ㅤ" /* 공백문자 */ + end;
      }
    }
    return { front, end };
  }

  let slashed = slasher(raw);
  while (true) {
    output.push(slashed.front);
    if (slashed.end) {
      slashed = slasher(slashed.end);
    } else {
      return output;
    }
  }
}

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

  const embed = new EmbedBuilder()
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
    .setTimestamp(interaction.createdAt);
  await embed_to_channel(interaction.client, process.env.LOG_CHANNEL_ID, embed);
}

export async function embed_to_channel(
  client: Client<true>,
  channel_id: string,
  embed: EmbedBuilder
) {
  const channel = await client.channels.fetch(channel_id);
  if (!channel.isTextBased()) return;
  channel.send({ embeds: [embed] });
}

export async function delete_members_who_left(
  client: Client<true>,
  guild: Guild
) {
  const members_collection = firebase.collection("members");
  const members = await members_collection.get();
  for (const doc of members.docs) {
    const data = doc.data() as TUser;
    try {
      await guild.members.fetch(data.discord_id);
    } catch {
      doc.ref.delete();

      const embed = new EmbedBuilder()
        .setTitle("물갈이")
        .setColor(0x0099ff)
        .setFields([
          { name: "Discord Id", value: data.discord_id },
          { name: "Minecraft Uuid", value: data.minecraft_uuid },
        ])
        .setTimestamp(new Date());
      await embed_to_channel(client, process.env.LOG_CHANNEL_ID, embed);
    }
  }
}
