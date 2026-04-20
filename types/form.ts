export type QuestionType =
  | "short_text"
  | "paragraph"
  | "multiple_choice"
  | "checkbox"
  | "dropdown"
  | "scale"
  | "date"
  | "section_header";

export interface FormQuestion {
  question: string;
  type: QuestionType;
  options?: string[]; // For multiple_choice, checkbox, dropdown
  required?: boolean;
  scaleMin?: number; // For scale
  scaleMax?: number; // For scale
  scaleMinLabel?: string;
  scaleMaxLabel?: string;
}

export interface FormSchema {
  title: string;
  description?: string;
  questions: FormQuestion[];
}

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}
