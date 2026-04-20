import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { generateFormStream, generateForm } from "@/lib/openai";
import { validateFormSchema } from "@/lib/parser";
import { connectDB, isDBConnected } from "@/lib/db";
import User from "@/models/User";
import Form from "@/models/Form";
import {
  countWords,
  resetCreditsIfNeeded,
  hasEnoughCredits,
  deductCredits,
} from "@/lib/credits";
import { ConversationMessage } from "@/types/form";

export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Validate input
    const body = await req.json().catch(() => ({}));
    const { prompt, history = [], stream: useStream = true } = body as {
      prompt: string;
      history: ConversationMessage[];
      stream: boolean;
    };

    if (!prompt || typeof prompt !== "string" || prompt.trim().length < 5) {
      return NextResponse.json(
        { error: "Please provide a valid prompt (at least 5 characters)." },
        { status: 400 }
      );
    }

    // 3. Connect to DB
    await connectDB().catch(() => null);

    // --- DEMO MODE BYPASS if DB not connected ---
    if (!isDBConnected()) {
      if (useStream) {
        const rawSchema = await generateForm(prompt, history);
        const validatedSchema = validateFormSchema(rawSchema);
        const encoder = new TextEncoder();
        const demoStream = new ReadableStream({
          start(controller) {
            const words = `I've built a ${validatedSchema.questions.length}-question form: "${validatedSchema.title}".`.split(" ");
            let i = 0;
            const interval = setInterval(() => {
              if (i < words.length) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ delta: words[i] + " " })}\n\n`)
                );
                i++;
              } else {
                clearInterval(interval);
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      done: true,
                      schema: validatedSchema,
                      formId: `demo-${Date.now()}`,
                      creditsRemaining: 999,
                      isDemo: true,
                    })}\n\n`
                  )
                );
                controller.close();
              }
            }, 40);
          },
        });

        return new Response(demoStream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        });
      }

      const rawSchema = await generateForm(prompt, history);
      const validatedSchema = validateFormSchema(rawSchema);
      return NextResponse.json({
        ...validatedSchema,
        formId: `demo-${Date.now()}`,
        creditsRemaining: 999,
        isDemo: true,
      });
    }

    // 4. Fetch/create user
    let user = await User.findOne({ email: session.user.email });
    if (!user) {
      user = await User.create({
        email: session.user.email,
        name: session.user.name || "User",
        image: session.user.image || "",
        plan: "free",
        creditsRemaining: 800,
        lastReset: new Date(),
      });
    }

    // 5. Reset credits if new day
    user = await resetCreditsIfNeeded(user);

    // 6. Check credits
    const creditCost = 50; // Fixed 50 credits per form generation
    if (!hasEnoughCredits(user, creditCost)) {
      return NextResponse.json(
        { error: "Not enough credits. Please upgrade your plan.", creditsRemaining: user.creditsRemaining },
        { status: 403 }
      );
    }

    // 7. Deduct credits early (optimistic)
    user = await deductCredits(user, creditCost);

    // 8. Streaming response
    if (useStream) {
      const aiStream = await generateFormStream(prompt, history);

      // We need to intercept the 'done' event to save the form to DB
      // We do this by piping through a TransformStream
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      let savedFormId: string | null = null;

      const transformStream = new TransformStream({
        async transform(chunk, controller) {
          const text = decoder.decode(chunk);
          const lines = text.split("\n").filter((l) => l.startsWith("data: "));

          for (const line of lines) {
            try {
              const payload = JSON.parse(line.slice(6));

              if (payload.done && payload.schema) {
                // Save form to DB
                try {
                  const validatedSchema = validateFormSchema(payload.schema);
                  const form = await Form.create({
                    userId: user!._id,
                    prompt,
                    title: validatedSchema.title,
                    schema: validatedSchema as unknown as Record<string, unknown>,
                    status: "draft",
                  });
                  savedFormId = form._id.toString();

                  // Re-emit the done event with formId and credits
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({
                        done: true,
                        schema: validatedSchema,
                        formId: savedFormId,
                        creditsRemaining: user!.creditsRemaining,
                      })}\n\n`
                    )
                  );
                } catch {
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({
                        done: true,
                        schema: payload.schema,
                        formId: `temp-${Date.now()}`,
                        creditsRemaining: user!.creditsRemaining,
                      })}\n\n`
                    )
                  );
                }
              } else {
                // Pass through delta and error events unchanged
                controller.enqueue(encoder.encode(line + "\n\n"));
              }
            } catch {
              controller.enqueue(encoder.encode(line + "\n\n"));
            }
          }
        },
      });

      const responseStream = aiStream.pipeThrough(transformStream);

      return new Response(responseStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "X-Accel-Buffering": "no",
        },
      });
    }

    // 9. Non-streaming fallback
    const rawSchema = await generateForm(prompt, history);
    const validatedSchema = validateFormSchema(rawSchema);

    const form = await Form.create({
      userId: user!._id,
      prompt,
      title: validatedSchema.title,
      schema: validatedSchema as unknown as Record<string, unknown>,
      status: "draft",
    });

    return NextResponse.json({
      ...validatedSchema,
      formId: form._id,
      creditsRemaining: user!.creditsRemaining,
    });
  } catch (error: unknown) {
    console.error("Generate API Error:", error);
    if (error instanceof Error) {
      if (error.message.includes("Invalid form data")) {
        return NextResponse.json(
          { error: "AI produced an invalid form structure. Please try again." },
          { status: 500 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
