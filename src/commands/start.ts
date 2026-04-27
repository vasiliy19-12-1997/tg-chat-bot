import type { Bot, Context } from "grammy";

export function startCommandHandler(bot: Bot<Context>) {
  bot.command("start", async (ctx) => {
    await ctx.reply("Привет! Напиши мне вопрос, и я отвечу тебе");
  });
}
