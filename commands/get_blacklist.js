const { SlashCommandBuilder } = require("discord.js");
const mojangAPI = new (require("mojang-api-js"))();

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
  data: new SlashCommandBuilder().setName("get_blacklist").setDescription("show blicklist").setDMPermission(false),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const data = (await firebase.get()).val();
    for (let discord_search_point in data["members"]) {
      if (data["members"][discord_search_point].discord == interaction.user.id) {
        //이미 등록된 디코일경우
        let message = "";
        for (let discord_say_point in data["blacklist"]) {
          let discord_tag;
          try {
            const discord = await client.users.fetch(data["blacklist"][discord_say_point].discord);
            discord_tag = `${discord.username}#${discord.discriminator}`;
          } catch (e) {
            discord_tag = `Deleted User#0000`;
          }

          message = `${message}${discord_tag}(${data["blacklist"][discord_say_point].discord}):`;
          for (let minecraft_say_point in data["blacklist"][discord_say_point].minecraft) {
            let minecraft = await mojangAPI.uuidToName(data["blacklist"][discord_say_point].minecraft[minecraft_say_point]);
            message = `${message}${minecraft.name},`;
          }
          message = `${message.slice(0, -1)}\n`;
        }
        const userInfoFile = { attachment: Buffer.from(message), name: "data.txt" };
        await interaction.editReply({ files: [userInfoFile] });
        return;
      }
    } //신규 디코일 경우
    await interaction.editReply({ content: `\`에러\`:하나 이상의 아이디를 등록해야만 합니다. \`/add_nick\`을 살펴보세요.` });
  },
};
