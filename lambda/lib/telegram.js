import fs from "fs";
import axios from "axios";
import FormData from "form-data";

const TELEGRAM_CAPTION_LIMIT = 1024;

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

export async function sendAudioMessage(message, audioPath) {
  try {
    const form = new FormData();
    form.append("chat_id", telegramConfig.chatId);
    form.append("audio", fs.createReadStream(audioPath));

    if (message.length <= TELEGRAM_CAPTION_LIMIT) {
      form.append("caption", message);
      form.append("parse_mode", "HTML");

      await axios.post(`${telegramConfig.getBaseUrl()}/sendAudio`, form, {
        headers: form.getHeaders(),
      });
    } else {
      await axios.post(`${telegramConfig.getBaseUrl()}/sendAudio`, form, {
        headers: form.getHeaders(),
      });

      await sendMessage(message);
    }

    console.log("Audio message sent successfully");
  } catch (error) {
    console.error("Error sending audio message:", error);
    throw error;
  }
}

export async function sendPoll(question, options, correctIndex) {
  try {
    await axios.post(`${telegramConfig.getBaseUrl()}/sendPoll`, {
      chat_id: telegramConfig.chatId,
      question: question,
      options: JSON.stringify(options),
      type: "quiz",
      correct_option_id: correctIndex,
      is_anonymous: true,
      explanation_parse_mode: "HTML",
    });
    console.log("Poll sent successfully");
  } catch (error) {
    console.error("Error sending poll:", error);
    throw error;
  }
}
