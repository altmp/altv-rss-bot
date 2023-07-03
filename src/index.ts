import "./discord/events/messages";
import "./discord/events/command";
import "./discord/events/ready";

import { assertPaths } from "./io";
import { rssBot } from "./discord/bot";
import { config } from "./config";

assertPaths();
rssBot.login(config.bot.token);
