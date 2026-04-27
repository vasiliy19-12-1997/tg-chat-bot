import type { Bot, Context } from "grammy";
import { reminders } from "../services/reminders.js";

export function registrationRemindersHandler(bot: Bot<Context>) {
  bot.command("reminders", async (ctx) => {
    const chatReminders = reminders.filter((reminder) => reminder.chatId === ctx.chat.id);

    if (chatReminders.length === 0) {
      await ctx.reply("У тебя пока нет напоминанний");
      return;
    }

    const text = chatReminders
      .map((reminder, index) => {
        return `${index + 1}. ID: ${reminder.id}\nВремя: ${reminder.time}\nПовтор: ${reminder.repeat}\nТекст: ${reminder.text}`;
      })
      .join("\n\n");

    await ctx.reply(text);
  });
}
