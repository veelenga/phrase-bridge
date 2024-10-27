import OpenAI from "openai";
import fs from "fs";

const languageFunction = {
  name: "languageContent",
  description: "Generate structured language learning content",
  parameters: {
    type: "object",
    properties: {
      phrase: { type: "string" },
      transcription: { type: "string" },
      translation: { type: "string" },
      situations: {
        type: "array",
        items: { type: "string" },
        minItems: 1,
        maxItems: 2,
      },
      pronunciation: {
        type: "array",
        items: {
          type: "object",
          properties: {
            word: { type: "string" },
            explanation: { type: "string" },
          },
          required: ["word", "explanation"],
        },
        minItems: 1,
        maxItems: 3,
      },
      examples: {
        type: "array",
        items: {
          type: "object",
          properties: {
            source: { type: "string" },
            translation: { type: "string" },
          },
          required: ["source", "translation"],
        },
        minItems: 1,
        maxItems: 2,
      },
    },
    required: [
      "phrase",
      "transcription",
      "translation",
      "situations",
      "pronunciation",
      "examples",
    ],
  },
};

function client() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function generateContent(instructions) {
  if (typeof instructions !== "string") {
    throw new Error("Instructions must be a string");
  }

  try {
    const response = await client().chat.completions.create({
      model: process.env.OPENAI_API_TEXT_MODEL,
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
        function: { name: "languageContent" },
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

export async function generateAudio(input) {
  try {
    const response = await client().audio.speech.create({
      input: input,
      model: process.env.OPENAI_API_AUDIO_MODEL,
      voice: process.env.OPENAI_API_AUDIO_VOICE || "nova",
      speed: 0.9,
      response_format: "mp3",
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const audioPath = `/tmp/speech-${timestamp}.mp3`;

    fs.writeFileSync(audioPath, buffer);
    return audioPath;
  } catch (error) {
    console.error("Error generating audio:", error);
    return null;
  }
}

export function shouldGenerateAudio() {
  return Boolean(process.env.OPENAI_API_AUDIO_MODEL);
}

export async function generatePollOptions(phrase, correctTranslation) {
  try {
    const response = await client().chat.completions.create({
      model: process.env.OPENAI_API_TEXT_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are helping to create a language learning quiz. Generate plausible but incorrect translations that will help users learn the nuances of the language.",
        },
        {
          role: "user",
          content: `Generate 3 plausible but incorrect Ukrainian translations for this Polish phrase: "${phrase}".
The correct translation is: "${correctTranslation}".
Return JSON in format: { "options": ["incorrect1", "incorrect2", "incorrect3"] }`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const { options } = JSON.parse(response.choices[0].message.content);

    // Add correct translation and shuffle
    const allOptions = [...options, correctTranslation].sort(
      () => Math.random() - 0.5,
    );

    return {
      translations: allOptions,
      correctIndex: allOptions.indexOf(correctTranslation),
    };
  } catch (error) {
    console.error("Error generating poll options:", {
      error: error.message,
    });
    throw error;
  }
}
