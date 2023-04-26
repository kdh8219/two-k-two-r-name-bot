const { SlashCommandBuilder, PermissionFlagsBits, Client, GatewayIntentBits } = require("discord.js");
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

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.login(process.env.DISCORD_TOKEN);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("del_nick_super")
    .setDescription("del someone nickname on the list")
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
        await interaction.editReply({ content: "에러: 닉네임 검색을 실패했어요(닉네임을 정확하게 입력했나요?)", ephemeral: true });
        return;
      }
    }
    let data = await (await firebase.get()).val();
    const discord_id = interaction.options.getUser("discord").id;
    for (let discord_search_point in data["members"]) {
      if (data["members"][discord_search_point].discord == discord_id) {
        //이미 등록된 디코일경우
        for (let minecraft_search_point in data["members"][discord_search_point].minecraft) {
          if (data["members"][discord_search_point].minecraft[minecraft_search_point] == minecraft.id) {
            //이미 등록된 마크일경우
            data["members"][discord_search_point].minecraft.splice(minecraft_search_point, 1);
            if (data["members"][discord_search_point].minecraft.length == 0) {
              data["members"].splice(discord_search_point, 1);
            }

            await firebase.set(data);

            let discord_tag;
            try {
              const discord = await client.users.fetch(discord_id);
              discord_tag = `${discord.username}#${discord.discriminator}`;
            } catch (e) {
              discord_tag = `Deleted User#0000`;
            }
            await interaction.editReply({
              content: `삭제 완료:${discord_tag}(${discord_id})에게서 ${minecraft.name}(${minecraft.id})를 제거했습니다.`,
              ephemeral: true,
            });
            return;
          }
        } //신규 마크일경우
        await interaction.editReply({ content: `\`에러\`: 해당 유저에게 해당 마인크래프트 계정이 없습니다.`, ephemeral: true });
        return;
      }
    } //신규 디코일 경우
    await interaction.editReply({ content: `\`에러\`: 해당 유저를 찾을 수 없습니다.`, ephemeral: true });
  },
};
