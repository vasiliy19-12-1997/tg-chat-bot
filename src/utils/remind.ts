import type { Bot } from "grammy";
import { Reminder } from "../types/reminder.js";
import { checkReminders } from "./time.js";

export function startReminderScheduler(bot: Bot, reminders: Reminder[]) {
  setInterval(() => {
    checkReminders(bot, reminders).catch((error) => {
      console.error("Ошибка при проверке напоминаний", error);
    });
  }, 30 * 1000);
}
