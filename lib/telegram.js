import fs from "fs";
import axios from "axios";
import FormData from "form-data";
import { generatePollOptions } from "./openai.js";

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

const TELEGRAM_LIMITS = {
  POLL_OPTION_LENGTH: 100,
  POLL_QUESTION_LENGTH: 300,
  MAX_OPTIONS: 10,
};

function truncateOption(text, maxLength = TELEGRAM_LIMITS.POLL_OPTION_LENGTH) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}

export async function sendPoll(content, templates) {
  try {
    const { phrase, translation } = content;
    const { translations, correctIndex } = await generatePollOptions(
      phrase,
      translation,
    );

    // Truncate question if needed
    const question = truncateOption(
      templates.poll({ phrase }),
      TELEGRAM_LIMITS.POLL_QUESTION_LENGTH,
    );

    // Ensure all options are within limits
    const validOptions = translations.map((opt) => truncateOption(opt));

    await axios.post(`${telegramConfig.getBaseUrl()}/sendPoll`, {
      chat_id: telegramConfig.chatId,
      question,
      options: validOptions,
      type: "quiz",
      correct_option_id: correctIndex,
      is_anonymous: true,
      explanation: `Правильна відповідь: ${translation}`,
      explanation_parse_mode: "HTML",
      protect_content: false,
    });

    console.log("Poll sent successfully");
  } catch (error) {
    console.error("Error sending poll:", error);
    throw error;
  }
}
