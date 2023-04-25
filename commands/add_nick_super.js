const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const mojangAPI = new (require("mojang-api-js"))();

const firebase_admin = require("firebase-admin");
const { getDatabase } = require("firebase-admin/database");
const serviceAccount = require("../firebase/conf.json");
if (!firebase_admin.apps.length) {
  firebase_admin.initializeApp({
    credential: firebase_admin.credential.cert(serviceAccount),
    databaseURL: "https://two-k-two-r-name-bot-default-rtdb.firebaseio.com",
    databaseAuthVariableOverride: {
      uid: process.env.FIREBASE_UID,
    },
  });
}
const firebase = getDatabase().ref("/");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("add_nick_super")
    .setDescription("Add your nickname on the list and share it to 2k2rs")
    .addUserOption((option) => option.setName("discord").setDescription("discord account").setRequired(true))
    .addStringOption((option) => option.setName("minecraft_id").setDescription("id of the minecraft account").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    let minecraft;
    try {
      minecraft = await mojangAPI.nameToUuid(interaction.options.getString("minecraft_id"));
    } catch (err) {
      if (err.message == "204 status code") {
        await interaction.editReply({ content: "`에러`: 닉네임 검색을 실패했어요(닉네임을 정확하게 입력했나요?)", ephemeral: true });
        return;
      }
    }

    let data = (await firebase.get()).val();
    const discord_id = interaction.options.getUser("discord").id;

    for (let discord_search_point in data["blacklist"]) {
      if (data["blacklist"][discord_search_point].discord == discord_id) {
        await interaction.editReply({ content: "`에러`:해당 디스코드 아이디는 블랙리스팅 되었습니다!", ephemeral: true });
        return;
      }
      for (let minecraft_search_point in data["blacklist"][discord_search_point].minecraft) {
        if (data["blacklist"][discord_search_point].minecraft[minecraft_search_point] == minecraft["id"]) {
          await interaction.editReply({ content: "`에러`:해당 마인크래프트 아이디는 블랙리스팅 되었습니다!", ephemeral: true });
          return;
        }
      } //신규 마크일 경우
    } //신규 디코일 경우

    for (let discord_search_point in data["members"]) {
      for (let minecraft_search_point in data["members"][discord_search_point].minecraft) {
        if (data["members"][discord_search_point].minecraft[minecraft_search_point] == minecraft["id"]) {
          await interaction.editReply({ content: "`에러`:해당 마인크래프트 아이디는 이미 등록되었습니다!", ephemeral: true });
          return;
        }
      } //신규 마크일 경우
      if (data["members"][discord_search_point].discord == discord_id) {
        await interaction.editReply({ content: `${minecraft["name"]}(${minecraft["id"]})이 성공적으로 부계정으로 등록되었습니다!`, ephemeral: true });
        data["members"][discord_search_point].minecraft.push(minecraft["id"]);
        await firebase.set(data);
        return;
      }
    } //신규 디코일 경우
    await interaction.editReply({ content: `${minecraft["name"]}(${minecraft["id"]})님 2k2r에 오신것을 환영합니다!`, ephemeral: true });
    data["members"].push({ discord: discord_id, minecraft: [minecraft["id"]] });
    await firebase.set(data);
  },
};
