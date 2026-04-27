import { deepseekApiKey } from "../config/config.js";
import { DeepSeekMessage, DeepSeekResponse } from "../types/deepseek.js";

export async function askDeepSeek(userText: string): Promise<string> {
  const messages: DeepSeekMessage[] = [
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
      max_tokens: 1000,
    }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepSeek API error: ${response.status} ${response.statusText} - ${errorText}`);
  }
  const data = (await response.json()) as DeepSeekResponse;
  const answer = data.choices?.[0]?.message?.content?.trim();

  if (!answer) {
    throw new Error("No answer received from DeepSeek API");
  }
  return answer;
}
