import fs from "fs";
import axios from "axios";
import FormData from "form-data";

export const telegramConfig = {
  botToken: process.env.TELEGRAM_BOT_TOKEN,
  chatId: process.env.TELEGRAM_CHAT_ID,
  getBaseUrl() {
    return `https://api.telegram.org/bot${this.botToken}`;
  },
};

export async function sendMessage(message) {
  try {
    await axios.post(`${telegramConfig.getBaseUrl()}/sendMessage`, {
      chat_id: telegramConfig.chatId,
      text: message,
      parse_mode: "HTML",
    });
    console.log("Message sent successfully");
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}

export async function sendAudio(audioPath) {
  try {
    const form = new FormData();
    form.append("chat_id", telegramConfig.chatId);
    form.append("audio", fs.createReadStream(audioPath));

    await axios.post(`${telegramConfig.getBaseUrl()}/sendAudio`, form, {
      headers: form.getHeaders(),
    });
    console.log("Audio sent successfully");
  } catch (error) {
    console.error("Error sending audio:", error);
    throw error;
  }
}
