const languageFunction = {
  name: "generateLanguageContent",
  description: "Generate language learning content with specific structure",
  parameters: {
    type: "object",
    properties: {
      phrase: {
        type: "string",
        description: "The main phrase in source language",
      },
      transcription: {
        type: "string",
        description:
          "Phonetic transcription in target language alphabet with hyphens between syllables",
      },
      translation: {
        type: "string",
        description: "Translation in target language",
      },
      usage: {
        type: "object",
        description: "When and how to use the phrase",
        properties: {
          situations: {
            type: "array",
            items: { type: "string" },
            description: "2-3 specific situations where the phrase is used",
          },
        },
        required: ["situations"],
      },
      pronunciation: {
        type: "array",
        items: {
          type: "object",
          properties: {
            word: {
              type: "string",
              description:
                "The word from the phrase containing difficult sound",
            },
            explanation: {
              type: "string",
              description:
                "How to pronounce this word, focusing on difficult sounds",
            },
          },
          required: ["word", "explanation"],
        },
        description: "Pronunciation guide for difficult words in the phrase",
      },
      examples: {
        type: "array",
        items: {
          type: "object",
          properties: {
            source: {
              type: "string",
              description: "Example in source language",
            },
            translation: { type: "string", description: "Example translation" },
          },
          required: ["source", "translation"],
        },
        description: "2-3 alternative examples",
      },
    },
    required: [
      "phrase",
      "transcription",
      "translation",
      "usage",
      "pronunciation",
      "examples",
    ],
  },
};

export default languageFunction;
