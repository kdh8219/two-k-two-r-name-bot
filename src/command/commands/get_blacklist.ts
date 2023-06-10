import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

import firebase from "../../wrapper/firebase.js";
import { TUser } from "../../types.js";
import mojangAPI from "../../wrapper/mojang-api.js";

export default {
  data: new SlashCommandBuilder()
    .setName("get_blacklist")
    .setDescription("show blacklist")
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

    let text = "";
    for (const member of blacklist_data) {
      let discord_tag: string;
      try {
        discord_tag = (await interaction.client.users.fetch(member[0])).tag;
      } catch (e) {
        discord_tag = `Deleted User#0000`;
      }
      text += discord_tag;
      text += `(${discord_id})`;

      text += " : ";
      for (const minecraft_uuid of member[1]) {
        text += await mojangAPI.getIdFromUUID(minecraft_uuid);
        text += ", ";
      }
      text = text.slice(0, -2);
      text += "\n";
    }

    const buffer_file = {
      attachment: Buffer.from(text),
      name: "blacklist.txt",
    };
    await interaction.editReply({ files: [buffer_file] });
  },
};
