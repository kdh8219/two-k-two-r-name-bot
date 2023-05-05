import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";

import firebase from "../../wrapper/firebase.js";
import { embed_to_channel } from "../../functions.js";

export default {
  data: new SlashCommandBuilder()
    .setName("del_user_super")
    .setDescription("del someone on the list")
    .addUserOption((option) =>
      option
        .setName("discord")
        .setDescription("discord account")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),
  async execute(interaction: ChatInputCommandInteraction) {
    const discord_id = interaction.options.getUser("discord")?.id as string;
    const members = firebase.collection("members");

    const should_remove = await members
      .where("discord_id", "==", discord_id)
      .get();

    if (!should_remove.empty) {
      should_remove.forEach((item) => {
        item.ref.delete();
      });

      let discord_tag;
      try {
        const discord_user = await interaction.client.users.fetch(discord_id);
        discord_tag = discord_user.tag;
      } catch {
        discord_tag = "Deleted User#0000";
      }

      await interaction.editReply({
        content: `삭제 완료:${discord_tag}의 계정을 모두 제거했습니다.`,
      });
      const embed = new EmbedBuilder()
        .setTitle("User deleted")
        .setColor(0x0099ff)
        .setFields([
          {
            name: "Command sender",
            value: `${interaction.user.tag}(${interaction.user.id})`,
          },
          { name: " ", value: " " },
          { name: "Target Discord Id", value: discord_id },
        ])
        .setTimestamp(interaction.createdAt);
      await embed_to_channel(
        interaction.client,
        process.env.LOG_CHANNEL_ID,
        embed
      );
      return;
    } else {
      await interaction.editReply({
        content: `\`에러\`: 해당 유저를 찾을 수 없습니다.`,
      });
    }
  },
};
