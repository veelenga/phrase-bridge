import { fileURLToPath } from "url";
import path from "path";
import { registerHelpers, loadTemplates } from "./lib/config.js";
import { generatePoll } from "./lib/openai.js";
import { sendPoll } from "./lib/telegram.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BRIDGE = process.env.BRIDGE;
const [target_lng, source_lng] = BRIDGE.split("-");
const BRIDGES_DIR = path.join(__dirname, "bridges", BRIDGE);

registerHelpers();

const templates = loadTemplates(BRIDGES_DIR);
const instructions = templates.pollInstructions({
  weekday: new Date().toLocaleString("en-US", { weekday: "long" }),
  target_lng,
  source_lng,
});

export async function handler() {
  if (!instructions) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Poll instruction file not found" }),
    };
  }

  try {
    const pollContent = await generatePoll(instructions);

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

// If running locally, invoke the handler
if (!process.env.AWS_EXECUTION_ENV) {
  handler().catch(console.error);
}
