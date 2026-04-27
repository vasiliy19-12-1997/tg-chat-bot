import "dotenv/config";
import { Bot } from "grammy";
import { token } from "./config/config.js";
import { reminders } from "./services/reminders.js";
import { startReminderScheduler } from "./utils/remind.js";
import { registrationDeleteReminderHandler } from "./commands/deleteReminder.js";
import { registrationMessageHandler } from "./commands/message.js";
import { registrationRemindHandler } from "./commands/remind.js";
import { startCommandHandler } from "./commands/start.js";
import { registrationRemindersHandler } from "./commands/reminders.js";

if (!token) {
  throw new Error("BOT_TOKEN is not set");
}
export const bot = new Bot(token);

startCommandHandler(bot);
registrationRemindHandler(bot);
registrationRemindersHandler(bot);
registrationDeleteReminderHandler(bot);
registrationMessageHandler(bot);
startReminderScheduler(bot, reminders);

bot.catch((err) => {
  console.error("Global bot error:", err);
});

bot.start();
console.log("Telegram bot started");
