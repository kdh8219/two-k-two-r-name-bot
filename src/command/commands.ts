import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Collection,
} from "discord.js";

import add_nick_super from "./commands/add_nick_super.js";
import add_nick from "./commands/add_nick.js";
import del_nick_super from "./commands/del_nick_super.js";
import del_user_super from "./commands/del_user_super.js";
import get_blacklist from "./commands/get_blacklist.js";
import get_file from "./commands/get_file.js";
import get_members from "./commands/get_members.js";
import get_raw_file from "./commands/get_raw_file.js";
import mov_blacklist_super from "./commands/mov_blacklist_super.js";
import ping from "./commands/ping.js";
import search from "./commands/search.js";

const commands: TCommand[] = [
  add_nick_super,
  add_nick,
  del_nick_super,
  del_user_super,
  get_blacklist,
  get_file,
  get_members,
  get_raw_file,
  mov_blacklist_super,
  ping,
  search,
];
export default commands;

export type TCommand = {
  data: SlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
};
export function getCommands(): Collection<string, TCommand> {
  const commandCollection = new Collection<string, TCommand>();
  for (const command of commands) {
    commandCollection.set(command.data.name, command);
  }
  return commandCollection;
}
