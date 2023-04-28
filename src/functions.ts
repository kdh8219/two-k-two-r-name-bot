import {
  Collection,
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";

import commands from "./command/commands.js";

export type TCommand = {
  data: SlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => void;
};
export function getCommands(): Collection<string, TCommand> {
  const commandColection = new Collection<string, TCommand>();
  for (const command of commands) {
    commandColection.set(command.data.name, command);
  }
  return commandColection;
}

export type TUser = {
  discord_id: string; // id
  minecraft_uuid: string; //uuid
};
