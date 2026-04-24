export const token = process.env.BOT_TOKEN;
export const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
export const PORT = Number(process.env.PORT || 3000);

if (!deepseekApiKey) {
  throw new Error("DEEPSEEK_API_KEY is not set");
}
