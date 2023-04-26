import { Collection, SlashCommandBuilder } from "discord.js";

import commands from "./command/commands.js";

export type TCommand = {
  data: SlashCommandBuilder;
  execute: Function;
};
export function getCommands(): Collection<string, TCommand> {
  const commandColection = new Collection<string, TCommand>();
  for (const command of commands) {
    commandColection.set(command.data.name, command);
  }
  return commandColection;
}

export type TUser = {
  discord: string; // id
  minecraft: string[]; //uuid
};

// export type TData = {
//   blacklist: TUser[];
//   members: TUser[];
// };
// export enum EUserType {
//   Unregistered,
//   Blacklisted,
//   Member,
// }
// export function check_user_type_by_discord_id(
//   data: TData,
//   discord_id: string
// ): EUserType {
//   for (let discord_search_point in data["blacklist"]) {
//     if (data.blacklist[discord_search_point].discord === discord_id) {
//       return EUserType.Blacklisted;
//     }
//   }
//   for (let discord_search_point in data["members"]) {
//     if (data.blacklist[discord_search_point].discord === discord_id) {
//       return EUserType.Member;
//     }
//   }
//   return EUserType.Unregistered;
// }

// export function check_user_type_by_minecraft_uuid(
// data: TData,
//   minecraft_uuid: string
// ): EUserType {
//   for (let discord_search_point in data.blacklist) {
//     for (let minecraft_search_point in data.blacklist[discord_search_point]
//       .minecraft) {
//       if (
//         data.blacklist[discord_search_point].minecraft[
//           minecraft_search_point
//         ] === minecraft_uuid
//       ) {
//         return EUserType.Blacklisted;
//       }
//     }
//   }
//   for (let discord_search_point in data.members) {
//     for (let minecraft_search_point in data.members[discord_search_point]
//       .minecraft) {
//       if (
//         data.members[discord_search_point].minecraft[minecraft_search_point] ===
//         minecraft_uuid
//       ) {
//         return EUserType.Member;
//       }
//     }
//   }
//   return EUserType.Unregistered;
// }
