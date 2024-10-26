import path from "path";
import fs from "fs";
import Handlebars from "handlebars";

export const registerHelpers = () => {
  Handlebars.registerHelper("bulletList", function (items) {
    if (!Array.isArray(items)) return "";
    return items.map((item) => `• ${item}`).join("\n");
  });

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
};

export const loadTemplates = (dir) => {
  const messageTemplate = fs.readFileSync(
    path.join(dir, "message.hbs"),
    "utf8",
  );
  const audioTemplate = fs.readFileSync(path.join(dir, "audio.hbs"), "utf8");

  return {
    message: Handlebars.compile(messageTemplate.trim()),
    audio: Handlebars.compile(audioTemplate.trim()),
  };
};

export const loadInstructions = (dir) =>
  fs.readFileSync(path.join(dir, "instructions.md"), "utf8");
