import "./events/messages";
import "./events/command";
import "./events/ready";

import { assertPaths } from "./io";
import { config } from "./config";
import { rssBot } from "./bot";

assertPaths();
rssBot.login(config.bot.token);
