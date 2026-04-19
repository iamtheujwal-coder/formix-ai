import { FormSchema, QuestionType } from "../types/form";

export const validateFormSchema = (data: any): FormSchema => {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid form data: Not an object");
  }

  if (typeof data.title !== "string" || !data.title.trim()) {
    throw new Error("Invalid form data: Missing or empty title");
  }

  if (!Array.isArray(data.questions)) {
    throw new Error("Invalid form data: Questions must be an array");
  }

  const validTypes = ["short_text", "paragraph", "multiple_choice"];

  const questions = data.questions.map((q: any) => {
    if (typeof q.question !== "string" || !q.question.trim()) {
      throw new Error("Invalid question: Missing question text");
    }

    if (!validTypes.includes(q.type)) {
      throw new Error(`Invalid question type: ${q.type}`);
    }

    if (q.type === "multiple_choice") {
      if (!Array.isArray(q.options) || q.options.length === 0) {
        throw new Error(
          "Invalid question: Multiple choice must have an options array"
        );
      }
    }

    return {
      question: q.question,
      type: q.type as QuestionType,
      options: q.type === "multiple_choice" ? q.options : undefined,
    };
  });

  return {
    title: data.title,
    questions,
  };
};
