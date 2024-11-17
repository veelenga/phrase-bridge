import {
  generateContent,
  generateAudio,
  shouldGenerateAudio,
} from "../lib/openai.js";
import { sendAudioMessage, sendMessage } from "../lib/telegram.js";
import { getBridgeTemplates } from "../lib/config.js";

async function sendContent(content, templates) {
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

export default async function phraseHandler() {
  const { templates, instructions, targetLanguage, sourceLanguage } =
    getBridgeTemplates();

  const messageInstructions = instructions.message({
    targetLanguage,
    sourceLanguage,
    weekday: new Date().toLocaleString("en-US", { weekday: "long" }),
  });

  if (!messageInstructions) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Message instruction file not found" }),
    };
  }

  try {
    const content = await generateContent(messageInstructions);
    if (content) {
      await sendContent(content, templates);

      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Content sent successfully" }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Content generation failed" }),
    };
  } catch (error) {
    console.error("Error in handler:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
