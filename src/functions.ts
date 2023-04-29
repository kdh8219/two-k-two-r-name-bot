import {
  Collection,
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";

import commands from "./command/commands.js";

export type TCommand = {
  data: SlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
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

export function dmSlice(raw: string): string[] {
  const output: string[] = [];
  function slasher(txt: string): { front: string; end: string } {
    if (txt.length <= 2000) {
      return {
        front: txt,
        end: "",
      };
    }
    let front = txt.slice(0, 2000);
    let end = txt.slice(2000, txt.length);
    if (end) {
      let tolast = front.slice(front.lastIndexOf("\n"), -1);
      front = front.slice(0, front.lastIndexOf("\n"));
      end = tolast + end;
    }
    return { front, end };
  }

  let slashed = slasher(raw);
  while (true) {
    output.push(slashed.front);
    if (slashed.end) {
      slashed = slasher(slashed.end);
    } else {
      return output;
    }
  }
}
