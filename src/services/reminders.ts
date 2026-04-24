import { Reminder } from "../types/reminder.ts";
import { isValidTime } from "../utils/time.ts";

export const reminders: Reminder[] = [];

export async function validateParts(ctx: any) {
  const parts = ctx.message?.text.split(" ");
  if (parts) {
    if (parts?.length < 4) {
      await ctx.reply("Формат: /remind HH:MM once|daily Текст напоминания");
      return;
    }
  }
}
export function parseRemindCommand(incomingText: string) {
  const parts = incomingText.split(" ");

  const time = parts[1];
  const repeat = parts[2] as "once" | "daily";
  const text = parts.slice(3).join(" ");
  return { time, repeat, text };
}

export async function validateRemindInput(ctx: any) {
  const { time, text, repeat } = parseRemindCommand(ctx.message?.text || "");
  if (!isValidTime(time)) {
    await ctx.reply("Некорректное время. Используй формат HH:MM, например 21:00");
    return;
  }
  if (repeat !== "once" && repeat !== "daily") {
    await ctx.reply('Некорректный repeat. Используй только "once" или "daily"');
    return;
  }
  if (!text.trim()) {
    await ctx.reply("Текст напоминания не должен быть пустым");
    return;
  }
}

export function createReminder(ctx: any) {
  const { time, text, repeat } = parseRemindCommand(ctx.message?.text || "");
  const reminder: Reminder = {
    id: crypto.randomUUID(),
    text,
    time,
    repeat,
    chatId: ctx.chat.id,
  };
  return reminder;
}

export function saveReminder(reminder: Reminder) {
  reminders.push(reminder);
}
