import type { Bot, Context } from "grammy";
import { deleteReminderById } from "../storage/reminderStorage.js";

export function registrationDeleteReminderHandler(bot: Bot<Context>) {
  bot.command("delete_reminder", async (ctx) => {
    const parts = ctx.message?.text.split(" ");
    if (parts) {
      if (parts?.length !== 2 || ctx.chat?.id === undefined) {
        await ctx.reply("Формат: /delete_reminder ID");
        return;
      }
      const reminderId = parts[1];
      const deletedReminder = deleteReminderById(reminderId, ctx.chat.id);

      if (!deletedReminder) {
        await ctx.reply("Напоминание не найдено");
        return;
      }
      await ctx.reply(
        `Напоминание удалено:\n${deletedReminder.time} | ${deletedReminder.repeat} | ${deletedReminder.text}`,
      );
    }
  });
}
