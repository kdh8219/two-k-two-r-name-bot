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
let message = "";
const cache_at = new Date();
try {
  (async () => {
    const data = (await firebase.get()).val();
    for (let discord_search_point in data["members"]) {
      try {
        let discord = await client.users.fetch(data["members"][discord_search_point].discord);
        message = `${message}\`${discord.username}#${discord.discriminator}(${data["members"][discord_search_point].discord}):`;
      } catch (e) {
        message = `${message}\`Deleted User#0000(${data["members"][discord_search_point].discord}):`;
      }
      for (let minecraft_search_point in data["members"][discord_search_point].minecraft) {
        let minecraft = await mojangAPI.uuidToName(data["members"][discord_search_point].minecraft[minecraft_search_point]);
        message = `${message}${minecraft.name}(${minecraft.id}), `;
      }
      message = `${message.slice(0, -2)}\`\n`;
    }
    message.replaceAll(/_/g, "\\_");
  })();
} catch {
  message = "`에러`: 캐싱중 에러 발생. `/ping`의 runner와 함께 <@945705462966411275>(kdh8219#5087)에게 문의주세요";
}

module.exports = {
  data: new SlashCommandBuilder().setName("get_users").setDescription("show users").setDMPermission(false),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    let isUser = false;
    const data = (await firebase.get()).val();
    for (let discord_search_point in data["members"]) {
      if (data["members"][discord_search_point].discord == interaction.user.id) {
        isUser = true;
      }
    }
    if (isUser) {
      await interaction.editReply({ content: `2000자를 넘어 DM으로 나눠 발송합니다.\n\`\`\`\nCaching at:${cache_at}\`\`\`` });
      const dm = await client.users.fetch(interaction.member.user.id, false);
      function slasher(txt) {
        let front = txt.slice(0, 2001);
        let end = txt.slice(2001, -1);
        if (end) {
          let tolast = front.slice(front.lastIndexOf("\n"), -1);
          front = front.slice(0, front.lastIndexOf("\n"));
          end = tolast + end;
        }
        return { front, end };
      }
      let { front, end } = slasher(message);
      dm.send(front);
      while (true) {
        if (end) {
          let message_ = end;
          let slashed = slasher(message_);
          front = slashed.front;
          end = slashed.end;
          dm.send(front);
        } else {
          return;
        }
      }
    } else {
      await interaction.editReply({ content: `\`에러\`:하나 이상의 아이디를 등록해야만 합니다. \`/add_nick\`을 살펴보세요.` });
    }
  },
};
