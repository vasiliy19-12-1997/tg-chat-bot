import type { Reminder } from "../types/reminder.js";

const reminders: Reminder[] = [];

export function addReminder(reminder: Reminder) {
  reminders.push(reminder);
}

export function getReminders() {
  return reminders;
}

export function getRemindersByChatId(chatId: number) {
  return reminders.filter((reminder) => reminder.chatId === chatId);
}

export function deleteReminderById(reminderId: string, chatId: number) {
  const index = reminders.findIndex((reminder) => reminder.id === reminderId && reminder.chatId === chatId);
  if (index !== -1) {
    const deletedReminder = reminders[index];
    reminders.splice(index, 1);
    return deletedReminder;
  }
  return undefined;
}
