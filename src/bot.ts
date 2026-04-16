import "dotenv/config";
import { Bot } from "grammy";
import express from "express";
import crypto from "node:crypto";
import fs, { existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import e from "express";

const token = process.env.BOT_TOKEN;
const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
const PORT = Number(process.env.PORT || 3000);
const TIMEZONE_OFFSET = Number(process.env.TIMEZONE_OFFSET || 0);
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!token) {
  throw new Error("BOT_TOKEN is not set");
}

if (!deepseekApiKey) {
  throw new Error("DEEPSEEK_API_KEY is not set");
}

if (!supabaseUrl) {
  throw new Error("SUPABASE_URL is not set");
}

if (!supabaseAnonKey) {
  throw new Error("SUPABASE_ANON_KEY is not set");
}

const bot = new Bot(token);
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type deepSeekMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

type deepseekChoice = {
  message?: {
    content?: string;
  };
};

type deepseekResponse = {
  choices?: deepseekChoice[];
};

type Reminder = {
  id: string;
  chatId: number;
  text: string;
  time: string; // формат HH:MM
  repeat: "once" | "daily";
  lastTriggeredAt?: string;
};

const reminders: Reminder[] = [];

async function askDeepSeek(userText: string): Promise<string> {
  const messages: deepSeekMessage[] = [
    {
      role: "system",
      content: "You are a helpful assistant that answers questions based on the provided context.",
    },
    {
      role: "user",
      content: userText,
    },
  ];
  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${deepseekApiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages,
      temperature: 0.7,
      max_token: 1000,
    }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepSeek API error: ${response.status} ${response.statusText} - ${errorText}`);
  }
  const data = (await response.json()) as deepseekResponse;
  const answer = data.choices?.[0]?.message?.content?.trim();

  if (!answer) {
    throw new Error("No answer received from DeepSeek API");
  }
  return answer;
}

//utils
function isValidTime(time: string): boolean {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
}

function getTargetDate(): Date {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
  const targetMs = utcMs + TIMEZONE_OFFSET * 60 * 60 * 1000;

  return new Date(targetMs);
}
function getCurrentTime() {
  const targetDate = getTargetDate();

  const hours = String(targetDate.getHours()).padStart(2, "0");
  const minutes = String(targetDate.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

function getCurrentMinuteKey(): string {
  const targetDate = getTargetDate();
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, "0");
  const day = String(targetDate.getDate()).padStart(2, "0");
  const hours = String(targetDate.getHours()).padStart(2, "0");
  const minutes = String(targetDate.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

async function checkReminders(): Promise<void> {
  const currentTime = getCurrentTime();
  const currentMinuteKey = getCurrentMinuteKey();

  for (let i = reminders.length - 1; i >= 0; i--) {
    const reminder = reminders[i];
    if (reminder.time === currentTime && reminder.lastTriggeredAt !== currentMinuteKey) {
      await bot.api.sendMessage(reminder.chatId, `⏰ Напоминание: ${reminder.text}`);
      reminder.lastTriggeredAt = currentMinuteKey;
      if (reminder.repeat === "once") {
        console.log("Удаляю одноразовое напоминание:", reminder.id);
        reminders.splice(i, 1);
        await supabase.from("reminders").delete().eq("id", reminder.id);
      }
    }
  }
}

async function saveReminderToSupabase(reminder: Reminder) {
  const { error } = await supabase.from("reminders").insert([
    {
      id: reminder.id,
      chat_id: reminder.chatId,
      text: reminder.text,
      time: reminder.time,
      repeat: reminder.repeat,
      last_triggered_at: reminder.lastTriggeredAt || null,
    },
  ]);

  if (error) {
    console.error("Ошибка при сохранении напоминания в Supabase:", error.message);
  } else {
    console.log("Напоминание сохранено в Supabase:", reminder.id);
  }
}

async function loadRemindersFromSupabase() {
  const { data, error } = await supabase.from("reminders").select("*");

  if (error) {
    console.error("Ошибка при загрузке напоминаний из Supabase:", error.message);
    return;
  }
  if (!data) {
    return;
  }
  //очистим текущий массив напоминаний перед загрузкой из базы
  reminders.length = 0;

  //переводим поля из snakecase в camelCase и пушим в массив
  data.forEach((row: any) => {
    reminders.push({
      id: row.id,
      chatId: row.chat_id,
      text: row.text,
      time: row.time,
      repeat: row.repeat,
      lastTriggeredAt: row.last_triggered_at ?? undefined,
    });
  });
  console.log("Все напоминания загружены в память:", reminders.length);
}

console.log("Напоминания загружены из файла:", reminders.length);
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
    // saveRemindersToFile();
    await saveReminderToSupabase(reminder);
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
    await supabase.from("reminders").delete().eq("id", reminderId);
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

bot.catch((err) => {
  console.error("Global bot error:", err);
});

const app = express();
app.get("/", (_req, res) => {
  res.send("Bot is runnnng...");
});

app.get("/health", (_req, res) => {
  res.status(200).json({ status: true });
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
async function startBot() {
  await loadRemindersFromSupabase();
  bot.start();
  console.log("Telegram bot started");
}

startBot();
