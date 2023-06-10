import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

import firebase from "../../wrapper/firebase.js";
import mojangAPI from "../../wrapper/mojang-api.js";
import { TUser } from "../../types.js";
import { dm_slice } from "../../functions/dm_slice.js";

export default {
  data: new SlashCommandBuilder()
    .setName("get_members")
    .setDescription("show users")
    .setDMPermission(false),
  async execute(interaction: ChatInputCommandInteraction) {
    const discord_id = interaction.user.id;

    const members = firebase.collection("members");

    if ((await members.where("discord_id", "==", discord_id).get()).empty) {
      await interaction.editReply({
        content: "`에러`: 하나 이상의 아이디를 등록해야 합니다.",
      });
      return;
    }

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

    let text = "";
    for (const member of member_data) {
      let nickname: string;
      try {
        nickname =
          (await interaction.guild.members.fetch(member[0])).nickname ||
          (await interaction.client.users.fetch(member[0])).username;
      } catch (e) {
        nickname = ` `;
      }
      let tag: string;
      try {
        tag = (await interaction.client.users.fetch(member[0])).tag;
      } catch (e) {
        tag = `Deleted User#0000`;
      }
      text += "- ";
      text += `\`${nickname}\``;
      text += `【\`${tag}\`】`;
      text += `[${member[0]}]`;

      text += "\n";
      for (const minecraft_uuid of member[1]) {
        text += " - ";
        text += `\`${await mojangAPI.getIdFromUUID(minecraft_uuid)}\``;
        text += `[${minecraft_uuid}]`;
        text += "\n";
      }
      text = text.slice(0, -1);
      text += "\n\n";
    }
    const sliced = dm_slice(text);
    for (const chunk of sliced) {
      await interaction.user.send(chunk);
    }
    await interaction.editReply("dm을 확인해주세요.");
  },
};
