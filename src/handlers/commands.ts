import crypto from "node:crypto";
import { bot } from "../bot.ts";
import { askDeepSeek } from "../services/apiDeepseek.ts";
import { reminders } from "../services/reminders.ts";
import { Reminder } from "../types/reminder.ts";
import { isValidTime, checkReminders } from "../utils/time.ts";

bot.command("start", async (ctx) => {
  await ctx.reply("Привет! Напиши мне вопрос, и я отвечу тебе");
});
bot.command("remind", async (ctx) => {
  const parts = ctx.message?.text.split(" ");
  if (parts) {
    if (parts?.length < 4) {
      await ctx.reply("Формат: /remind HH:MM once|daily Текст напоминания");
      return;
    }
    const time = parts[1];
    const repeat = parts[2] as "once" | "daily";
    const text = parts.slice(3).join(" ");

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
    const reminder: Reminder = {
      id: crypto.randomUUID(),
      text,
      time,
      repeat,
      chatId: ctx.chat.id,
    };
    reminders.push(reminder);
    await ctx.reply(`Напоминание сохранено: ${time}, ${repeat}, ${text}`);
  }
});
bot.command("reminders", async (ctx) => {
  const chatReminders = reminders.filter((reminder) => reminder.chatId === ctx.chat.id);

  if (chatReminders.length === 0) {
    await ctx.reply("У тебя пока нет напоминанний");
    return;
  }

  const text = chatReminders
    .map((reminder, index) => {
      return `${index + 1}. ID: ${reminder.id}\nВремя: ${reminder.time}\nПовтор: ${reminder.repeat}\nТекст: ${reminder.text}`;
    })
    .join("\n\n");

  await ctx.reply(text);
});
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
setInterval(() => {
  checkReminders().catch((error) => {
    console.error("Ошибка при проверке напоминаний", error);
  });
}, 30 * 1000);
bot.on("message", async (ctx) => {
  const userText = ctx.message.text;
  if (!userText) {
    await ctx.reply("Пожалуйста, отправьте текстовое сообщение.");
    return;
  }
  try {
    await ctx.reply("Думаю...");
    const answer = await askDeepSeek(userText);
    await ctx.reply(answer);
  } catch (error) {
    console.error("Error processing message:", error);
    await ctx.reply("Не удалось получить ответ");
  }
});
