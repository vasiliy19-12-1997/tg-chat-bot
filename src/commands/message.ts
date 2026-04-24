import { bot } from "../bot.ts";
import { askDeepSeek } from "../services/apiDeepseek.ts";

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
