import path from "path";
import fs from "fs";
import Handlebars from "handlebars";

export const registerHelpers = () => {
  Handlebars.registerHelper("pronunciationList", function (items) {
    if (!Array.isArray(items)) return "";
    return items.map((d) => `• "${d.word}" — ${d.explanation}`).join("\n");
  });

  Handlebars.registerHelper("examplesList", function (examples) {
    if (!Array.isArray(examples)) return "";
    return examples
      .map((ex) => `• ${ex.source} — ${ex.translation}`)
      .join("\n");
  });

  Handlebars.registerHelper("eq", function (a, b) {
    return a === b;
  });
};

export const loadTemplates = (dir) => {
  const instructions = fs.readFileSync(
    path.join(dir, "instructions.hbs"),
    "utf8",
  );
  const messageTemplate = fs.readFileSync(
    path.join(dir, "message.hbs"),
    "utf8",
  );
  const audioTemplate = fs.readFileSync(path.join(dir, "audio.hbs"), "utf8");

  const pollInstructions = fs.readFileSync(
    path.join(dir, "pollInstructions.hbs"),
    "utf8",
  );

  return {
    instructions: Handlebars.compile(instructions.trim()),
    message: Handlebars.compile(messageTemplate.trim()),
    audio: Handlebars.compile(audioTemplate.trim()),
    pollInstructions: Handlebars.compile(pollInstructions.trim()),
  };
};
