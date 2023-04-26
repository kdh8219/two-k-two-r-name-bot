import { TCommand } from "../functions.js";

import add_nick_super from "./commands/add_nick_super.js";
import add_nick from "./commands/add_nick.js";
import del_nick_super from "./commands/del_nick_super.js";
import ping from "./commands/ping.js";

const commands: TCommand[] = [add_nick_super, add_nick, del_nick_super, ping];
export default commands;
