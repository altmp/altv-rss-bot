import "./discord/events/messages";
import "./discord/events/command";
import "./discord/events/ready";

import { assertPaths } from "./io";
import { config } from "./config";
import { rssBot } from "./discord/bot";

assertPaths();
rssBot.login(config.bot.token);
