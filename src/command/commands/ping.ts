import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("check ping")
    .setDMPermission(false),
  async execute(interaction: ChatInputCommandInteraction) {
    const defer = await interaction.reply({
      content: "Pinging...",
      fetchReply: true,
      ephemeral: true,
    });
    interaction.editReply({
      content: `**PONG🏓**\n\`\`\`\n
        Websocket heartbeat: ${interaction.client.ws.ping}ms.
      \nRoundtrip latency: ${
        defer.createdTimestamp - interaction.createdTimestamp
      }ms\nRunner: ${process.env.RUNNER_NAME}\n\`\`\``,
    });
  },
};
