const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

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
  data: new SlashCommandBuilder()
    .setName("mov_blacklist_super")
    .setDescription("add user to blacklist")
    .addUserOption((option) =>
      option
        .setName("discord")
        .setDescription("discord id of blacklister")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    let data = (await firebase.get()).val();
    const discord_id = interaction.options.getUser("discord_id").id;
    for (let discord_search_point in data["members"]) {
      if (data["members"][discord_search_point].discord == discord_id) {
        //이미 등록된 디코가 있을경우
        const blackListing = data["members"][discord_search_point];
        data["members"].splice(discord_search_point, 1);
        data["blacklist"].push(blackListing);
        await firebase.set(data);
        await interaction.editReply({
          content:
            "성공적으로 해당 discord id와 minecraft id를 블렉리스팅 했어요!",
          ephemeral: true,
        });
        return;
      }
    } //등록되지 않았을경우
    await interaction.editReply({
      content: "`에러`:해당 discord id를 찾을 수 없었어요",
      ephemeral: true,
    });
  },
};
