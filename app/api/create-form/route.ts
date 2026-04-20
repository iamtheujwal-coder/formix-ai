import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { createGoogleForm } from "@/lib/google";
import { validateFormSchema } from "@/lib/parser";
import { connectDB, isDBConnected } from "@/lib/db";
import Form from "@/models/Form";

export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json(
        {
          error: "Unauthorized: Please sign in with Google again.",
        },
        { status: 401 }
      );
    }

    // Parse input
    const body = await req.json().catch(() => ({}));
    
    // 2. Validate schema
    let validatedData;
    try {
      validatedData = validateFormSchema(body);
    } catch (err: any) {
      return NextResponse.json(
        { error: err.message || "Invalid form data schema" },
        { status: 400 }
      );
    }

    // 3. Create Google Form and Add questions (Logic combined in lib/google.ts)
    const result = await createGoogleForm(session.accessToken as string, validatedData);
    
    // 4. Update persistence record if formId exists
    const { formId } = body;
    if (formId && !formId.toString().startsWith("demo-")) {
      await connectDB();
      if (isDBConnected()) {
        try {
          await Form.findByIdAndUpdate(formId, {
            googleFormLink: result.link,
            status: "published",
          });
        } catch (dbErr) {
          console.warn("Could not update form status in DB:", dbErr);
          // Don't fail the whole request just because DB update failed in hybrid states
        }
      }
    }

    // 5. Return link
    return NextResponse.json({ link: result.link });
  } catch (error: unknown) {
    console.error("Create Form Route Error:", error);
    
    const message = error instanceof Error ? error.message : "Failed to create Google Form";
    
    // Check for specific Google API errors if possible, or generic 500
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
