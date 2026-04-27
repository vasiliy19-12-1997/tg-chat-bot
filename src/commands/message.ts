import { askDeepSeek } from "../services/apiDeepseek.js";
import type { Bot, Context } from "grammy";

export function registrationMessageHandler(bot: Bot<Context>) {
  bot.on("message", async (ctx) => {
    const userText = ctx.message.text;
    if (!userText) {
      await ctx.reply("Пожалуйста, отправьте текстовое сообщение.");
      return;
    }
    try {
      await ctx.reply("Думаю...");
      const answer = await askDeepSeek(userText);
      await ctx.reply(answer);
    } catch (error) {
      console.error("Error processing message:", error);
      await ctx.reply("Не удалось получить ответ");
    }
  });
}
