import { Client, EmbedBuilder } from "discord.js";

export async function send_embed(
  client: Client<true>,
  channel_id: string,
  embed: EmbedBuilder[]
) {
  const channel = await client.channels.fetch(channel_id);
  if (!channel.isTextBased()) return;
  channel.send({ embeds: embed });
}
