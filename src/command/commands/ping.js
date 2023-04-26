const { SlashCommandBuilder, Client, GatewayIntentBits } = require("discord.js");
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.login(process.env.DISCORD_TOKEN);

module.exports = {
  data: new SlashCommandBuilder().setName("ping").setDescription("check ping").setDMPermission(false),
  async execute(interaction) {
    const defer = await interaction.reply({ content: "Pinging...", fetchReply: true, ephemeral: true });
    interaction.editReply({
      content: `**PONG🏓**\n\`\`\`\n${/*Websocket heartbeat: ${client.ws.ping}ms.*/ ""}\nRoundtrip latency: ${defer.createdTimestamp - interaction.createdTimestamp}ms\nRunner: ${
        process.env.RUNNER_NAME
      }\n\`\`\``,
    });
  },
};
