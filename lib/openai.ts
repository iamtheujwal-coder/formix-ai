import OpenAI from "openai";
import { FormSchema, ConversationMessage } from "@/types/form";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
  baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
});

const SYSTEM_PROMPT = `You are Formix AI, an expert form builder assistant. Convert the user's prompt into a strict JSON schema for a Google Form.

The output MUST exactly match this JSON structure:
{
  "title": "string",
  "description": "string (optional, 1-2 sentence form description)",
  "questions": [
    {
      "question": "string",
      "type": "short_text | paragraph | multiple_choice | checkbox | dropdown | scale | date | section_header",
      "required": true,
      "options": ["string"],
      "scaleMin": 1,
      "scaleMax": 5,
      "scaleMinLabel": "string",
      "scaleMaxLabel": "string"
    }
  ]
}

Rules:
- "type" must be exactly one of: "short_text", "paragraph", "multiple_choice", "checkbox", "dropdown", "scale", "date", "section_header"
- Only include "options" array if type is "multiple_choice", "checkbox", or "dropdown" (minimum 2 options)
- Only include scale fields if type is "scale"
- "section_header" has no question text beyond the section title — use "question" field as the section name
- "required" defaults to true for important questions, false for optional ones
- Generate at least 6 relevant, professional questions
- Use a variety of question types where appropriate — not just short_text
- For "section_header", use it to divide longer forms into logical sections
- Only return valid JSON. No markdown formatting.`;

// In-memory LRU cache for identical prompts (50 slots, 1hr TTL)
const responseCache = new Map<string, { result: FormSchema; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour
const MAX_CACHE_SIZE = 50;

function getCachedResponse(prompt: string): FormSchema | null {
  const key = prompt.toLowerCase().trim();
  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.result;
  }
  if (cached) responseCache.delete(key);
  return null;
}

function setCachedResponse(prompt: string, result: FormSchema): void {
  const key = prompt.toLowerCase().trim();
  if (responseCache.size >= MAX_CACHE_SIZE) {
    // Evict oldest
    const firstKey = responseCache.keys().next().value;
    if (firstKey) responseCache.delete(firstKey);
  }
  responseCache.set(key, { result, timestamp: Date.now() });
}

export const generateFormStream = async (
  prompt: string,
  conversationHistory: ConversationMessage[] = []
): Promise<ReadableStream<Uint8Array>> => {
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    // Include last 3 turns of conversation for context
    ...conversationHistory.slice(-6).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user", content: prompt },
  ];

  const stream = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages,
    stream: true,
    temperature: 0.7,
    max_tokens: 3000,
    response_format: { type: "json_object" },
  });

  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        let fullContent = "";
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content || "";
          if (delta) {
            fullContent += delta;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`)
            );
          }
        }
        // Send the final parsed schema
        try {
          const parsed = JSON.parse(fullContent);
          if (!parsed.title || !Array.isArray(parsed.questions)) {
            throw new Error("Invalid form schema structure from AI");
          }
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ done: true, schema: parsed })}\n\n`
            )
          );
        } catch {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: "AI produced an invalid structure. Please try again." })}\n\n`
            )
          );
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Stream error occurred";
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`)
        );
      } finally {
        controller.close();
      }
    },
  });
};

// Non-streaming fallback (used for caching checks and demo mode)
export const generateForm = async (
  prompt: string,
  conversationHistory: ConversationMessage[] = []
): Promise<FormSchema> => {
  // Check cache first
  const cached = getCachedResponse(prompt);
  if (cached) return cached;

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...conversationHistory.slice(-6).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user", content: prompt },
  ];

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages,
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 3000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response from AI");

    const parsed = JSON.parse(content);
    if (!parsed.title || !Array.isArray(parsed.questions)) {
      throw new Error("Invalid form schema structure from AI");
    }

    const schema = parsed as FormSchema;
    setCachedResponse(prompt, schema);
    return schema;
  } catch (error: unknown) {
    console.error("AI Generation Error:", error);
    if (error instanceof Error) {
      throw new Error(`AI generation failed: ${error.message}`);
    }
    throw new Error("Failed to generate form schema");
  }
};
