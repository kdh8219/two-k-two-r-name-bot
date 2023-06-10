import { ChatInputCommandInteraction } from "discord.js";

import mojangAPI from "../wrapper/mojang-api.js";

export async function data_to_string(
  interaction: ChatInputCommandInteraction,
  discord_id: string,
  minecraft_uuids: string[]
) {
  let text = "";
  let nickname: string;
  let tag: string;
  try {
    const guild_user = await interaction.guild.members.fetch(discord_id);
    if (guild_user) {
    }
    const client_user = await interaction.client.users.fetch(discord_id);
    tag =
      client_user.tag.split("#")[1] != "0"
        ? client_user.tag
        : "@" + client_user.tag.split("#")[0];
    nickname = guild_user.nickname || client_user.username;
  } catch (e) {
    nickname = ` `;
    tag = `Deleted User#0000`;
  }
  text += "- ";
  text += `\`${nickname}\``;
  text += `【\`${tag}\`】`;
  text += `[${discord_id}}]`;

  text += "\n";
  for (const minecraft_uuid of minecraft_uuids) {
    text += " - ";
    text += `\`${await mojangAPI.getIdFromUUID(minecraft_uuid)}\``;
    text += `[${minecraft_uuid}]`;
    text += "\n";
  }
  text = text.slice(0, -1);
  return text;
}
