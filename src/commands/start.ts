import { bot } from "../bot.ts";

bot.command("start", async (ctx) => {
  await ctx.reply("Привет! Напиши мне вопрос, и я отвечу тебе");
});
