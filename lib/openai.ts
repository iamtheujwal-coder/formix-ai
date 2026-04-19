import OpenAI from "openai";
import { FormSchema } from "../types/form";

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY || "dummy_key",
  baseURL: "https://api.groq.com/openai/v1", // Points to Groq's free OpenAI-compatible API
});

export const generateForm = async (prompt: string): Promise<FormSchema> => {
  const systemPrompt = `You are a Form Builder API. Convert the user's prompt into a strict JSON schema for a form.
The output MUST exactly match this JSON structure:
{
  "title": "string",
  "questions": [
    {
      "question": "string",
      "type": "short_text | paragraph | multiple_choice",
      "options": ["string", "string"] // Only include options array if type is multiple_choice
    }
  ]
}

Only return valid JSON. Do not include markdown formatting like \`\`\`json.`;

  try {
    const response = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile", // Using Groq's insanely fast and free LLaMA 3.3 model!
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response from AI");

    const parsed = JSON.parse(content);
    return parsed as FormSchema;
  } catch (error) {
    console.error("OpenAI Generation Error:", error);
    throw new Error("Failed to generate form schema");
  }
};
