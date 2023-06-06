import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";

import { onTime } from "../../main.js";

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
          name: "RoundTrip latency",
          value: `${defer.createdTimestamp - interaction.createdTimestamp}ms`,
        },
        {
          name: "When bot Turned on",
          value: `<t:${~~(onTime.getTime() / 1000)}:R>`,
        }
      )
      .setFooter({ text: `Bot runner: ${process.env.RUNNER_NAME}` });

    await interaction.editReply({ content: "", embeds: [embed] });
  },
};
