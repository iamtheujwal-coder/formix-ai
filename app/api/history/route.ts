import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import Form from "@/models/Form";
import User from "@/models/User";
import { connectDB, isDBConnected } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    
    if (!isDBConnected()) {
      return NextResponse.json([]); // Demo Mode: No history
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const forms = await Form.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json(forms);
  } catch (error: unknown) {
    console.error("History API Error:", error);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const formId = searchParams.get("id");

    if (!formId) {
      return NextResponse.json({ error: "Form ID is required" }, { status: 400 });
    }

    await connectDB();

    if (!isDBConnected()) {
      return NextResponse.json({ error: "Cannot delete in Demo Mode" }, { status: 400 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const result = await Form.findOneAndDelete({ _id: formId, userId: user._id });

    if (!result) {
      return NextResponse.json({ error: "Form not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ message: "Form deleted successfully" });
  } catch (error: unknown) {
    console.error("History Delete API Error:", error);
    return NextResponse.json({ error: "Failed to delete form" }, { status: 500 });
  }
}
