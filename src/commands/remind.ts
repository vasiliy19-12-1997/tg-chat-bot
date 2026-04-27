import {
  createReminder,
  parseRemindCommand,
  saveReminder,
  validateParts,
  validateRemindInput,
} from "../services/reminders.js";
import type { Bot, Context } from "grammy";

export function registrationRemindHandler(bot: Bot<Context>) {
  bot.command("remind", async (ctx) => {
    await validateParts(ctx);
    const { time, repeat, text } = parseRemindCommand(ctx.message?.text || "");
    await validateRemindInput(ctx);
    const reminder = createReminder(ctx);
    saveReminder(reminder);
    await ctx.reply(`Напоминание сохранено: ${time}, ${repeat}, ${text}`);
  });
}
