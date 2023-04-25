const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");

const firebase_admin = require("firebase-admin");
const { getDatabase } = require("firebase-admin/database");
const serviceAccount = require("../firebase/conf.json");
if (!firebase_admin.apps.length) {
  firebase_admin.initializeApp({
    credential: firebase_admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_URL,
    databaseAuthVariableOverride: {
      uid: process.env.FIREBASE_UID,
    },
  });
}
const firebase = getDatabase().ref("/");

module.exports = {
  data: new SlashCommandBuilder().setName("get_file").setDescription("get the file").setDMPermission(false),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const data = (await firebase.get()).val();
    let is_registed = false;

    text = "{members:[";
    for (let discord_search_point in data["members"]) {
      for (let minecraft_search_point in data["members"][discord_search_point].minecraft) {
        text = text + "'" + data["members"][discord_search_point].minecraft[minecraft_search_point] + "',";
      }
      if (data["members"][discord_search_point].discord == interaction.user.id) {
        is_registed = true;
      }
    }
    text = text.slice(0, -1) + "], blacklist:[";

    for (let discord_search_point in data["blacklist"]) {
      for (let minecraft_search_point in data["blacklist"][discord_search_point].minecraft) {
        text = text + "'" + data["blacklist"][discord_search_point].minecraft[minecraft_search_point] + "',";
      }
    }
    text = text.slice(0, -1) + "]}";

    if (is_registed) {
      const userInfoFile = { attachment: Buffer.from(text), name: "data.json" };
      await interaction.editReply({ content: `*** 절대 이 파일을 공유하지 마세요***`, files: [userInfoFile] });
    } else {
      await interaction.editReply({ content: `\`에러\`:하나 이상의 아이디를 등록해야만 합니다. \`/add_nick\`을 살펴보세요.` });
    }
  },
};
