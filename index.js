import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";
import axios from "axios";

import {
  registerHelpers,
  loadInstructions,
  loadTemplates,
} from "./lib/config.js";
import languageFunction from "./lib/language-function.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BRIDGE = process.env.BRIDGE;
const BRIDGES_DIR = path.join(__dirname, "bridges", BRIDGE);

const instructions = loadInstructions(BRIDGES_DIR);
const templates = loadTemplates(BRIDGES_DIR);

registerHelpers();

export async function handler() {
  if (!instructions) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Instruction file not found" }),
    };
  }

  try {
    const content = await generateContent();
    if (content) {
      const textMessage = templates.message(content);
      await sendMessage(textMessage);

      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Message sent successfully" }),
      };
    } else {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Content generation failed" }),
      };
    }
  } catch (error) {
    console.error("Error in handler:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}

async function generateContent() {
  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.chat.completions.create({
      model: process.env.OPENAI_API_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a language teaching assistant specializing in creating educational content for language learners.",
        },
        { role: "user", content: instructions },
      ],
      tools: [{ type: "function", function: languageFunction }],
      tool_choice: {
        type: "function",
        function: { name: "generateLanguageContent" },
      },
      temperature: 0.7,
    });

    const toolCall = response.choices[0].message.tool_calls[0];
    const content = JSON.parse(toolCall.function.arguments);
    console.debug("Generated content:", content);
    return content;
  } catch (error) {
    console.error("Error generating content:", error);
    throw error;
  }
}

async function sendMessage(message) {
  try {
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    await axios.post(url, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: "HTML",
    });
    console.log("Message sent successfully.");
  } catch (error) {
    console.error(
      "Error sending message:",
      error.response ? error.response.data : error.message,
    );
    throw error;
  }
}

// If running locally, invoke the main function
if (process.env.NODE_ENV !== "lambda") {
  (async () => {
    try {
      const content = await generateContent();
      if (content) {
        const textMessage = templates.message(content);
        await sendMessage(textMessage);
      } else {
        console.error("No content generated.");
      }
    } catch (error) {
      console.error("Error in main function:", error.message);
    }
  })();
}
