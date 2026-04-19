export type QuestionType = "short_text" | "paragraph" | "multiple_choice";

export interface FormQuestion {
  question: string;
  type: QuestionType;
  options?: string[]; // Only for multiple_choice
}

export interface FormSchema {
  title: string;
  questions: FormQuestion[];
}
