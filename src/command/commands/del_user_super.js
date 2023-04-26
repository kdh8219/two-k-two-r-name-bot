const { SlashCommandBuilder, PermissionFlagsBits, Client, GatewayIntentBits } = require("discord.js");

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

// const { token } = require('../config.json');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.login(process.env.DISCORD_TOKEN);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("del_user_super")
    .setDescription("del someone on the list")
    .addUserOption((option) => option.setName("discord").setDescription("discord account").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    let data = (await firebase.get()).val();
    const discord_id = interaction.options.getUser("discord").id;
    for (let discord_search_point in data["members"]) {
      if (data["members"][discord_search_point].discord == discord_id) {
        //이미 등록된 디코일경우
        data["members"].splice(discord_search_point, 1);
        await firebase.set(data);
        await interaction.editReply({ content: `삭제 완료:<@${discord_id}>를 제거했습니다.`, ephemeral: true });
        return;
      }
    } //신규 디코일 경우
    await interaction.editReply({ content: `\`에러\`: 해당 유저를 찾을 수 없습니다.`, ephemeral: true });
  },
};
