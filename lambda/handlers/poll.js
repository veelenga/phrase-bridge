import { generatePoll } from "../lib/openai.js";
import { sendPoll } from "../lib/telegram.js";
import { getBridgeTemplates } from "../lib/config.js";

export default async function pollHandler() {
  const { instructions, targetLanguage, sourceLanguage } = getBridgeTemplates();

  const pollInstructions = instructions.poll({
    targetLanguage,
    sourceLanguage,
    weekday: new Date().toLocaleString("en-US", { weekday: "long" }),
  });

  if (!pollInstructions) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Poll instruction file not found" }),
    };
  }

  try {
    const pollContent = await generatePoll(pollInstructions);

    if (pollContent) {
      const { question, options, correctIndex } = pollContent;
      await sendPoll(question, options, correctIndex);

      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Poll sent successfully" }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Poll generation failed" }),
    };
  } catch (error) {
    console.error("Error in poll handler:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
