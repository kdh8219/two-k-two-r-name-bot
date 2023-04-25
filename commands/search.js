const { SlashCommandBuilder, Client, GatewayIntentBits } = require("discord.js");
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.login(process.env.DISCORD_TOKEN);

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
  data: new SlashCommandBuilder()
    .setName("search")
    .setDescription("search info")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("by_discord")
        .setDescription("search info by discord")
        .addUserOption((option) => option.setName("discord").setDescription("discord account").setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("by_minecraft")
        .setDescription("search info by minecraft")
        .addStringOption((option) => option.setName("minecraft").setDescription("minecraft id").setRequired(true))
    )
    .setDMPermission(false),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const data = (await firebase.get()).val();
    let is_2k2r = false;
    let found = false;
    if (interaction.options.getSubcommand() === "by_discord") {
      let result = "";
      const searching_discord_id = interaction.options.getUser("discord").id;
      const requester_discord_id = interaction.user.id;
      for (let discord_search_point in data["members"]) {
        const this_discord = data["members"][discord_search_point].discord;
        if (this_discord == requester_discord_id) {
          is_2k2r = true;
        }
        if (this_discord == searching_discord_id) {
          found = true;
          result = data["members"][discord_search_point].minecraft;
        }
      }
      if (is_2k2r) {
        if (!found) {
          interaction.editReply({ content: `\`에러\`: 해당 디스코드 계정은 등록되지 않았어요!` });
          return;
        }
        let mcid = "";
        for (let mcuuid in result) {
          mcid = mcid + (await mojangAPI.uuidToName(result[mcuuid])).name + ",";
        }
        interaction.editReply({ content: `${interaction.options.getUser("discord")}:${mcid.slice(0, -1)}` });
      } else {
        interaction.editReply({ content: `\`에러\`:하나 이상의 아이디를 등록해야만 합니다. \`/add_nick\`을 살펴보세요.` });
      }
    } else {
      let minecraft;
      try {
        minecraft = await mojangAPI.nameToUuid(interaction.options.getString("minecraft"));
      } catch (err) {
        if (err.message == "204 status code") {
          await interaction.editReply({ content: "`에러`: 닉네임 검색을 실패했어요(닉네임을 정확하게 입력했나요?)" });
          return;
        }
      }
      const requester_discord_id = interaction.user.id;
      let searched_discord;
      let searched_minecraft;
      for (let discord_search_point in data["members"]) {
        for (let minecraft_search_point in data["members"][discord_search_point].minecraft) {
          if (data["members"][discord_search_point].minecraft[minecraft_search_point] == minecraft.id) {
            searched_minecraft = data["members"][discord_search_point].minecraft;
            searched_discord = data["members"][discord_search_point].discord;
            found = true;
          }
        }
        if (data["members"][discord_search_point].discord == requester_discord_id) {
          is_2k2r = true;
        }
      }
      if (is_2k2r) {
        if (!found) {
          interaction.editReply({ content: `\`에러\`: 해당 마인크래프트 아이디는 등록되지 않았어요!` });
          return;
        }
        let mcid = "";
        for (let mcuuid in searched_minecraft) {
          mcid = mcid + (await mojangAPI.uuidToName(searched_minecraft[mcuuid])).name + ",";
        }
        interaction.editReply({ content: `<@${searched_discord}>:${mcid.slice(0, -1)}` });
      } else {
        interaction.editReply({ content: `\`에러\`:하나 이상의 아이디를 등록해야만 합니다. \`/add_nick\`을 살펴보세요.` });
      }
    }
  },
};
