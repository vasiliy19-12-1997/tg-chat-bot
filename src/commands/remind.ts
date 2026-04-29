import type { Bot, Context } from "grammy";
import { addReminder } from "../storage/reminderStorage.js";
import {
  validateParts,
  ValidationResult,
  parseRemindCommand,
  validateRemindInput,
  createReminder,
} from "../services/reminders.js";

export function registrationRemindHandler(bot: Bot<Context>) {
  bot.command("remind", async (ctx) => {
    if (validateParts(ctx) === ValidationResult.InvalidParts) {
      await ctx.reply("Некорректный формат команды. Используй: /remind HH:MM repeat text");
      return;
    }

    const validationResult = validateRemindInput(ctx);
    if (validationResult === ValidationResult.InvalidTime) {
      await ctx.reply("Некорректное время. Используй формат HH:MM, например 21:00");
      return;
    }
    if (validationResult === ValidationResult.InvalidRepeat) {
      await ctx.reply('Некорректный repeat. Используй только "once" или "daily"');
      return;
    }
    if (validationResult === ValidationResult.EmptyText) {
      await ctx.reply("Текст напоминания не должен быть пустым");
      return;
    }
    if (ctx.chat?.id === undefined) {
      await ctx.reply("Ошибка: не удалось определить ID чата");
      return;
    }

    const { time, repeat, text } = parseRemindCommand(ctx.message?.text || "");

    const reminder = createReminder(ctx, ctx.chat.id);
    addReminder(reminder);
    await ctx.reply(`Напоминание сохранено: ${time}, ${repeat}, ${text}`);
  });
}
