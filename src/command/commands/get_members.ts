import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

import firebase from "../../wrapper/firebase.js";
import mojangAPI from "../../wrapper/mojang-api.js";
import { TUser } from "../../functions.js";
// let message = "";
// const cache_at = new Date();
// try {
//   (async () => {
//     const data = (await firebase.get()).val();
//     for (let discord_search_point in data["members"]) {
//       try {
//         let discord = await client.users.fetch(data["members"][discord_search_point].discord);
//         message = `${message}\`${discord.username}#${discord.discriminator}(${data["members"][discord_search_point].discord}):`;
//       } catch (e) {
//         message = `${message}\`Deleted User#0000(${data["members"][discord_search_point].discord}):`;
//       }
//       for (let minecraft_search_point in data["members"][discord_search_point].minecraft) {
//         let minecraft = await mojangAPI.uuidToName(data["members"][discord_search_point].minecraft[minecraft_search_point]);
//         message = `${message}${minecraft.name}(${minecraft.id}), `;
//       }
//       message = `${message.slice(0, -2)}\`\n`;
//     }
//     message.replaceAll(/_/g, "\\_");
//   })();
// } catch {
//   message = "`에러`: 캐싱중 에러 발생. `/ping`의 runner와 함께 <@945705462966411275>(kdh8219#5087)에게 문의주세요";
// }

export default {
  data: new SlashCommandBuilder()
    .setName("get_members")
    .setDescription("show users")
    .setDMPermission(false),
  async execute(interaction: ChatInputCommandInteraction) {
    const discord_id = interaction.user.id;

    const members = firebase.collection("members");

    if ((await members.where("discord_id", "==", discord_id).get()).empty) {
      interaction.editReply({
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
    member_data.forEach(async (minecraft_uuids, discord_id) => {
      let discord_tag: string;
      try {
        discord_tag = (await interaction.client.users.fetch(discord_id)).tag;
      } catch (e) {
        discord_tag = `Deleted User#0000`;
      }
      text += discord_tag;
      text += `(${discord_id})`;

      text += " : ";
      minecraft_uuids.forEach(async (minecraft_uuid) => {
        text += await mojangAPI.getIdFromUUID(minecraft_uuid);
        text += ", ";
      });
      text = text.slice(0, text.length - 2);
    });

    const buffer_file = {
      attachment: Buffer.from(text),
      name: "members.txt",
    };
    await interaction.editReply({ files: [buffer_file] });
  },
};
