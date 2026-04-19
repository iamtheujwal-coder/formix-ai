import { NextResponse } from "next/server";
import { generateForm } from "@/lib/openai";
import { validateFormSchema } from "@/lib/parser";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Invalid prompt" }, { status: 400 });
    }

    const rawSchema = await generateForm(prompt);
    const validatedSchema = validateFormSchema(rawSchema);

    return NextResponse.json(validatedSchema);
  } catch (error: any) {
    console.error("Generate API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate form" },
      { status: 500 }
    );
  }
}
