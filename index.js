import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { registerHelpers, loadTemplates } from "./lib/config.js";

import {
  generateContent,
  generateAudio,
  shouldGenerateAudio,
} from "./lib/openai.js";
import { sendAudioMessage, sendMessage } from "./lib/telegram.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BRIDGE = process.env.BRIDGE;
const [target_lng, source_lng] = BRIDGE.split("-");
const BRIDGES_DIR = path.join(__dirname, "bridges", BRIDGE);

registerHelpers();

const templates = loadTemplates(BRIDGES_DIR);
const instructions = templates.instructions({
  weekday: new Date().toLocaleString("en-US", { weekday: "long" }),
  target_lng,
  source_lng,
});

export async function handler() {
  if (!instructions) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Instruction file not found" }),
    };
  }

  try {
    const content = await generateContent(instructions);
    if (content) {
      await sendContent(content);

      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Content sent successfully" }),
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

async function sendContent(content) {
  try {
    const textMessage = templates.message(content);

    if (shouldGenerateAudio()) {
      const audioPath = await generateAudio(templates.audio(content));
      if (audioPath) {
        await sendAudioMessage(textMessage, audioPath);
        fs.unlinkSync(audioPath);
      }
    } else {
      await sendMessage(textMessage);
    }
  } catch (error) {
    console.error("Error sending content:", error);
    throw error;
  }
}

// If running locally, invoke the main function
if (!process.env.AWS_EXECUTION_ENV) {
  (async () => {
    try {
      const content = await generateContent(instructions);
      if (content) {
        await sendContent(content);
      } else {
        console.error("No content generated.");
      }
    } catch (error) {
      console.error("Error in main function:", error.message);
    }
  })();
}
