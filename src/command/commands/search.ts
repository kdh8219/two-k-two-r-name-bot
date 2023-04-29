import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";

import firebase from "../../wrapper/firebase.js";
import mojangAPI from "../../wrapper/mojang-api.js";

export default {
  data: new SlashCommandBuilder()
    .setName("search")
    .setDescription("search info")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("by_discord")
        .setDescription("search info by discord")
        .addUserOption((option) =>
          option
            .setName("discord")
            .setDescription("discord account")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("by_minecraft")
        .setDescription("search info by minecraft")
        .addStringOption((option) =>
          option
            .setName("minecraft")
            .setDescription("minecraft id")
            .setRequired(true)
        )
    )
    .setDMPermission(false),
  async execute(interaction: ChatInputCommandInteraction) {
    const members = firebase.collection("members");
    if (
      (await members.where("discord_id", "==", interaction.user.id).get()).empty
    ) {
      await interaction.editReply({
        content: `\`에러\`:하나 이상의 아이디를 등록해야만 합니다.`,
      });
      return;
    }
    let discord_id;
    if (interaction.options.getSubcommand() === "by_minecraft") {
      const minecraft_id = interaction.options.getString("minecraft");
      let minecraft_uuid;
      try {
        minecraft_uuid = await mojangAPI.getUUIDFromId(minecraft_id);
      } catch {
        await interaction.editReply({
          content:
            "`에러`: 마인크래프트 닉네임 검색을 실패했습니다. 마인크래프트 닉네임을 정확하게 입력했나요?",
        });
        return;
      }
      const member = await members
        .where("minecraft_uuid", "==", minecraft_uuid)
        .get();
      if (member.empty) {
        await interaction.editReply({
          content: `\`에러\`: 해당 마인크래프트 아이디는 등록되지 않았어요!`,
        });
        return;
      }
      discord_id = member.docs[0].data()["discord_id"];
    } else {
      discord_id = interaction.options.getUser("discord").id;
    }

    const the_data = await members.where("discord_id", "==", discord_id).get();
    if (the_data.empty) {
      await interaction.editReply({
        content: "`에러`: 해당 멤버는 등록되지 않았어요!",
      });
    }
    let text = "";
    text +=
      (await interaction.guild.members.fetch(discord_id)).nickname ||
      interaction.user.username;
    text += ": ";
    for (const user of the_data.docs) {
      const minecraft_uuid = user.data()["minecraft_uuid"];
      text += await mojangAPI.getIdFromUUID(minecraft_uuid);
      text += ` [${minecraft_uuid}]`;
      text += ", ";
    }
    text = text.slice(0, -2);
    await interaction.editReply({
      content: text,
    });
  },
};
