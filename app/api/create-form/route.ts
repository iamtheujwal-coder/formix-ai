import { NextResponse } from "next/server";
import { createGoogleForm } from "@/lib/google";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { FormSchema } from "@/types/form";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.accessToken) {
      return NextResponse.json(
        { error: "Unauthorized or missing Google authorization." },
        { status: 401 }
      );
    }

    const formData: FormSchema = await req.json();
    if (!formData || !formData.title || !formData.questions) {
      return NextResponse.json(
        { error: "Invalid form data provided" },
        { status: 400 }
      );
    }

    const result = await createGoogleForm(session.accessToken, formData);
    return NextResponse.json({ link: result.link });
  } catch (error: any) {
    console.error("Create Form Route Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create Google Form" },
      { status: 500 }
    );
  }
}
