export type Reminder = {
  id: string;
  chatId: number;
  text: string;
  time: string; // формат HH:MM
  repeat: "once" | "daily";
  lastTriggeredAt?: string;
};
