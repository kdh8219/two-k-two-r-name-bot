import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";

import firebase from "../../wrapper/firebase.js";
import { TUser, embed_to_channel } from "../../functions.js";

export default {
  data: new SlashCommandBuilder()
    .setName("del_members_who_left_super")
    .setDescription(
      "물갈이(서버에 부하가 있으므로, 과도한 사용을 지양해주세요!)"
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),
  async execute(interaction: ChatInputCommandInteraction) {
    const members_collection = firebase.collection("members");
    const members = await members_collection.get();
    for (const doc of members.docs) {
      const data = doc.data() as TUser;
      try {
        await interaction.guild.members.fetch(data.discord_id);
      } catch {
        doc.ref.delete();

        const embed = new EmbedBuilder()
          .setTitle("물갈이됨")
          .setDescription("deleted")
          .setColor(0x0099ff)
          .setFields([
            {
              name: "Command Sender",
              value: `${interaction.user.tag}(${interaction.user.id})`,
            },
            { name: " ", value: " " },
            { name: "Discord Id", value: data.discord_id },
            { name: "Minecraft Uuid", value: data.minecraft_uuid },
          ])
          .setTimestamp(interaction.createdAt);
        await embed_to_channel(
          interaction.client,
          process.env.LOG_CHANNEL_ID,
          embed
        );
      }
    }

    // const should_remove = await members
    //   .where("discord_id", "==", discord_id)
    //   .get();

    // if (!should_remove.empty) {
    //   should_remove.forEach((item) => {
    //     item.ref.delete();
    //   });

    //   let discord_tag;
    //   try {
    //     const discord_user = await interaction.client.users.fetch(discord_id);
    //     discord_tag = discord_user.tag;
    //   } catch {
    //     discord_tag = "Deleted User#0000";
    //   }

    //   await interaction.editReply({
    //     content: `삭제 완료:${discord_tag}의 계정을 모두 제거했습니다.`,
    //   });
    //   const embed = new EmbedBuilder()
    //     .setTitle("User deleted")
    //     .setColor(0x0099ff)
    //     .setFields([
    //       {
    //         name: "Command sender",
    //         value: `${interaction.user.tag}(${interaction.user.id})`,
    //       },
    //       { name: " ", value: " " },
    //       { name: "Target Discord Id", value: discord_id },
    //     ])
    //     .setTimestamp(interaction.createdAt);
    //   await embed_to_channel(
    //     interaction.client,
    //     process.env.LOG_CHANNEL_ID,
    //     embed
    //   );
    //   return;
    // } else {
    //   await interaction.editReply({
    //     content: `\`에러\`: 해당 유저를 찾을 수 없습니다.`,
    //   });
    // }
  },
};
