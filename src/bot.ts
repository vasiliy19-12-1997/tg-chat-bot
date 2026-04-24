import "dotenv/config";
import { Bot } from "grammy";
import { token } from "./config/config.ts";

if (!token) {
  throw new Error("BOT_TOKEN is not set");
}
export const bot = new Bot(token);

import "./commands/remind.ts";
import "./commands/reminders.ts";
import "./commands/deleteReminder.ts";
import "./commands/start.ts";
import "./commands/message.ts";

bot.catch((err) => {
  console.error("Global bot error:", err);
});

bot.start();
console.log("Telegram bot started");
