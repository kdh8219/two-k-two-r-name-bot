const {
  SlashCommandBuilder,
  AttachmentBuilder,
  PermissionFlagsBits,
} = require("discord.js");

const firebase_admin = require("firebase-admin");
const { getDatabase } = require("firebase-admin/database");
const serviceAccount = require("../../firebase/conf.json");
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
    .setName("get_file_super")
    .setDescription("get the file")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    await interaction.editReply(
      "해당 커맨드에 버그가 있어서 임시로 비활성화 되었습니다..........."
    );
    // const data = (await firebase.get()).val();
    // for (let discord_search_point in data["members"]) {
    //   if (data["members"][discord_search_point].discord == interaction.user.id) {
    //     //이미 등록된 디코일경우
    //     const userInfoFile = { attachment: Buffer.from([data]), name: "data.json" };
    //     await interaction.editReply({ content: `*** 절대 이 파일을 공유하지 마세요***`, files: [userInfoFile] });

    //     return;
    //   }
    // } //신규 디코일 경우
    // await interaction.editReply({ content: `\`에러\`:하나 이상의 아이디를 등록해야만 합니다. \`/add_nick\`을 살펴보세요.` });
  },
};
