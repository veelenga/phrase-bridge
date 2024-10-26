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
        minItems: 2,
        maxItems: 3,
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
        minItems: 2,
        maxItems: 3,
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

export default languageFunction;
