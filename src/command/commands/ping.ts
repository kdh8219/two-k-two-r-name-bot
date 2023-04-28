import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";

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
    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle("***PONG🏓***")
      .addFields(
        {
          name: "Websocket heartbeat",
          value: `${interaction.client.ws.ping}ms`,
        },
        {
          name: "Roundtrip latency",
          value: `${defer.createdTimestamp - interaction.createdTimestamp}ms`,
        }
      )
      .setFooter({ text: `Bot runner: ${process.env.RUNNER_NAME}` });

    interaction.editReply({ embeds: [embed] });
  },
};
