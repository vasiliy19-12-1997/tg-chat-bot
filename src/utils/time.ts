import type { Reminder } from "../types/reminder.ts";

export function isValidTime(time: string): boolean {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
}
export function getCurrentTime(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}
export function getCurrentMinuteKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}
export async function checkReminders(bot: any, reminders: Reminder[]): Promise<void> {
  const currentTime = getCurrentTime();
  const currentMinuteKey = getCurrentMinuteKey();
  console.log(currentTime + "Текущее время");
  console.log(currentMinuteKey + "Текущие минуты");
  console.log(reminders + "Все напоминания");
  for (let i = reminders.length - 1; i >= 0; i--) {
    const reminder = reminders[i];
    if (reminder.time === currentTime && reminder.lastTriggeredAt !== currentMinuteKey) {
      await bot.api.sendMessage(reminder.chatId, `⏰ Напоминание: ${reminder.text}`);
      reminder.lastTriggeredAt = currentMinuteKey;
      if (reminder.repeat === "once") {
        console.log("Удаляю одноразовое напоминание:", reminder.id);
        reminders.splice(i, 1);
      }
    }
  }
}
