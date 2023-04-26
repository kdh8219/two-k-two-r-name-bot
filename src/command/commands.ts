import { TCommand } from "../functions.js";

import add_nick_super from "./commands/add_nick_super.js";
import add_nick from "./commands/add_nick.js";

const commands: TCommand[] = [add_nick_super, add_nick];
export default commands;
