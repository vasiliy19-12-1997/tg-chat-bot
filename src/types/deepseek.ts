export type DeepSeekMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type DeepSeekChoice = {
  message?: {
    content?: string;
  };
};

export type DeepSeekResponse = {
  choices?: DeepSeekChoice[];
};
