import { bot } from "../bot.ts";
import {
  createReminder,
  parseRemindCommand,
  reminders,
  saveReminder,
  validateParts,
  validateRemindInput,
} from "../services/reminders.ts";
import { checkReminders } from "../utils/time.ts";

bot.command("remind", async (ctx) => {
  await validateParts(ctx);
  const { time, repeat, text } = parseRemindCommand(ctx.message?.text || "");
  await validateRemindInput(ctx);
  const reminder = createReminder(ctx);
  saveReminder(reminder);
  await ctx.reply(`Напоминание сохранено: ${time}, ${repeat}, ${text}`);
});

setInterval(() => {
  checkReminders(bot, reminders).catch((error) => {
    console.error("Ошибка при проверке напоминаний", error);
  });
}, 30 * 1000);
