import "dotenv/config";
import { Bot } from "grammy";
import express from "express";

const token = process.env.BOT_TOKEN;
const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
const PORT = Number(process.env.PORT || 3000);

if (!token) {
  throw new Error("BOT_TOKEN is not set");
}

if (!deepseekApiKey) {
  throw new Error("DEEPSEEK_API_KEY is not set");
}
const bot = new Bot(token);

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

async function askDeepSeek(userText: string): Promise<string> {
  const messages: deepSeekMessage[] = [
    {
      role: "system",
      content:
        "You are a helpful assistant that answers questions based on the provided context.",
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
    throw new Error(
      `DeepSeek API error: ${response.status} ${response.statusText} - ${errorText}`,
    );
  }
  const data = (await response.json()) as deepseekResponse;
  const answer = data.choices?.[0]?.message?.content?.trim();

  if (!answer) {
    throw new Error("No answer received from DeepSeek API");
  }
  return answer;
}
bot.command("start", async (ctx) => {
  await ctx.reply("Привет! Напиши мне вопрос, и я отвечу тебе");
});
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

bot.start();

console.log("Telegram bot started");
