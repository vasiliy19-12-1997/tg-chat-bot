export type deepSeekMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type deepseekChoice = {
  message?: {
    content?: string;
  };
};

export type deepseekResponse = {
  choices?: deepseekChoice[];
};
