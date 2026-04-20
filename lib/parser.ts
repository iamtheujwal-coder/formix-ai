import { FormSchema, QuestionType } from "../types/form";

const VALID_TYPES: QuestionType[] = [
  "short_text",
  "paragraph",
  "multiple_choice",
  "checkbox",
  "dropdown",
  "scale",
  "date",
  "section_header",
];

const OPTIONS_TYPES: QuestionType[] = [
  "multiple_choice",
  "checkbox",
  "dropdown",
];

export const validateFormSchema = (data: unknown): FormSchema => {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid form data: Not an object");
  }

  const d = data as Record<string, unknown>;

  if (typeof d.title !== "string" || !d.title.trim()) {
    throw new Error("Invalid form data: Missing or empty title");
  }

  if (!Array.isArray(d.questions)) {
    throw new Error("Invalid form data: Questions must be an array");
  }

  const questions = (d.questions as unknown[]).map((q: unknown) => {
    if (!q || typeof q !== "object") throw new Error("Invalid question object");
    const question = q as Record<string, unknown>;

    if (
      typeof question.question !== "string" ||
      !question.question.trim()
    ) {
      throw new Error("Invalid question: Missing question text");
    }

    // Coerce unknown types to short_text gracefully
    const type = VALID_TYPES.includes(question.type as QuestionType)
      ? (question.type as QuestionType)
      : "short_text";

    const needsOptions = OPTIONS_TYPES.includes(type);
    let options: string[] | undefined;

    if (needsOptions) {
      options = Array.isArray(question.options) && question.options.length > 0
        ? (question.options as string[]).map(String)
        : ["Option 1", "Option 2"];
    }

    return {
      question: String(question.question).trim(),
      type,
      required: type === "section_header" ? undefined : (question.required as boolean | undefined) ?? true,
      options,
      ...(type === "scale" && {
        scaleMin: Number(question.scaleMin) || 1,
        scaleMax: Number(question.scaleMax) || 5,
        scaleMinLabel: String(question.scaleMinLabel || ""),
        scaleMaxLabel: String(question.scaleMaxLabel || ""),
      }),
    };
  });

  return {
    title: (d.title as string).trim(),
    description: typeof d.description === "string" ? d.description.trim() : undefined,
    questions,
  };
};
