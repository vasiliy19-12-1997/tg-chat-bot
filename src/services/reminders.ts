import type { Context } from "grammy";
import type { Reminder } from "../types/reminder.js";
import { isValidTime } from "../utils/time.js";

export enum ValidationResult {
  Valid,
  InvalidParts,
  InvalidTime,
  InvalidRepeat,
  EmptyText,
}
export function validateParts(ctx: Context) {
  if (!ctx.message?.text) {
    return ValidationResult.InvalidParts;
  }
  const parts = ctx.message?.text.split(" ");
  if (parts?.length < 4) {
    return ValidationResult.InvalidParts;
  } else {
    return ValidationResult.Valid;
  }
}
export function parseRemindCommand(incomingText: string) {
  const parts = incomingText.split(" ");

  const time = parts[1];
  const repeat = parts[2] as "once" | "daily";
  const text = parts.slice(3).join(" ");
  return { time, repeat, text };
}

export function validateRemindInput(ctx: Context) {
  const { time, text, repeat } = parseRemindCommand(ctx.message?.text || "");
  if (!isValidTime(time)) {
    return ValidationResult.InvalidTime;
  }
  if (repeat !== "once" && repeat !== "daily") {
    return ValidationResult.InvalidRepeat;
  }
  if (!text.trim()) {
    return ValidationResult.EmptyText;
  }
  return ValidationResult.Valid;
}

export function createReminder(ctx: Context, chatId: number): Reminder {
  const { time, text, repeat } = parseRemindCommand(ctx.message?.text || "");

  const reminder: Reminder = {
    id: crypto.randomUUID(),
    text,
    time,
    repeat,
    chatId: chatId,
  };
  return reminder;
}
