import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";

import mojangAPI from "../../wrapper/mojang-api.js";
import firebase from "../../wrapper/firebase.js";
import { send_embed } from "../../functions/send_embed.js";

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

    const minecraft_id = interaction.options.getString(
      "minecraft_id"
    ) as string;
    let minecraft_uuid: string;
    try {
      minecraft_uuid = await mojangAPI.getUUIDFromId(minecraft_id);
    } catch {
      await interaction.editReply({
        content:
          "`에러`: 마인크래프트 닉네임 검색을 실패했습니다. 마인크래프트 닉네임을 정확하게 입력했나요?",
      });
      return;
    }
    const members = firebase.collection("members");
    const the_member = await members
      .where("minecraft_uuid", "==", minecraft_uuid)
      .where("discord_id", "==", discord_id)
      .get();
    if (!the_member.empty) {
      the_member.forEach((member) => {
        member.ref.delete();
      });

      let discord_tag: string;
      try {
        const discord_user = await interaction.client.users.fetch(discord_id);
        discord_tag = discord_user.tag;
      } catch {
        discord_tag = "Deleted User#0000";
      }
      await interaction.editReply({
        content: `삭제 완료:${discord_tag}(${discord_id})에게서 ${minecraft_id}(${minecraft_uuid})를 제거했습니다.`,
      });

      await send_embed(interaction.client, process.env.LOG_CHANNEL_ID, [
        new EmbedBuilder()
          .setTitle("Nick deleted")
          .setColor(0x0099ff)
          .setFields([
            {
              name: "Command sender",
              value: `${interaction.user.tag}(${interaction.user.id})`,
            },
            { name: " ", value: " " },
            { name: "Target Discord Id", value: discord_id },
            { name: " ", value: " " },
            { name: "Minecraft Id", value: minecraft_id },
            { name: "Minecraft Uuid", value: minecraft_uuid },
          ])
          .setTimestamp(interaction.createdAt),
      ]);
    } else {
      await interaction.editReply({
        content: `\`에러\`: 해당 계정이 없습니다.`,
      });
    }
  },
};
