import { reminders } from "../services/reminders.js";
import type { Bot, Context } from "grammy";

export function registrationDeleteReminderHandler(bot: Bot<Context>) {
  bot.command("delete_reminder", async (ctx) => {
    const parts = ctx.message?.text.split(" ");
    if (parts) {
      if (parts?.length > 2) {
        await ctx.reply("Формат: /delete_reminder ID");
      }
      const reminderId = parts[1];

      const reminderIndex = reminders.findIndex(
        (reminder) => reminder.id === reminderId && reminder.chatId === ctx.chat.id,
      );
      if (reminderIndex === -1) {
        await ctx.reply("Напоминание не найдено");
        return;
      }
      const deletedReminder = reminders[reminderIndex];
      reminders.splice(reminderIndex, 1);
      await ctx.reply(
        `Напоминание удалено:\n${deletedReminder.time} | ${deletedReminder.repeat} | ${deletedReminder.text}`,
      );
    }
  });
}
