import "dotenv/config";
import { Bot } from "grammy";
import { token } from "./config/config.ts";

if (!token) {
  throw new Error("BOT_TOKEN is not set");
}
export const bot = new Bot(token);

bot.start();
console.log("Telegram bot started");

bot.catch((err) => {
  console.error("Global bot error:", err);
});
