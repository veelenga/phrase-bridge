import phraseHandler from "./handlers/phrase.js";
import pollHandler from "./handlers/poll.js";
import { setupBridge } from "./lib/config.js";

// Initialize bridge configuration
setupBridge();

export async function handler(event) {
  console.log("Event:", JSON.stringify(event));

  switch (event?.handler) {
    case "poll":
      return pollHandler();
    case "phrase":
    default:
      return phraseHandler();
  }
}

// For local development
if (!process.env.AWS_EXECUTION_ENV) {
  const event = process.argv[2]
    ? JSON.parse(process.argv[2])
    : { handler: "phrase" };
  handler(event).catch(console.error);
}
