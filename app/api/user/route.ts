import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import User from "@/models/User";
import Form from "@/models/Form";
import { connectDB, isDBConnected, getDBConnectionError } from "@/lib/db";
import { resetCreditsIfNeeded, getPlanLimit } from "@/lib/credits";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // If MongoDB is not configured, return defaults
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({
        email: session.user.email,
        name: session.user.name || "User",
        image: session.user.image || "",
        plan: "free",
        creditsRemaining: 800,
        dailyLimit: 800,
        lastReset: new Date(),
        dbConnected: false,
      });
    }

    await connectDB();
    
    if (!isDBConnected()) {
      return NextResponse.json({
        email: session.user.email,
        name: session.user.name || "Demo User",
        image: session.user.image || "",
        plan: "demo",
        creditsRemaining: 1000,
        dailyLimit: 1000,
        lastReset: new Date(),
        totalForms: 0,
        dbConnected: false,
        dbError: getDBConnectionError(),
      });
    }

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

    user = await resetCreditsIfNeeded(user);

    // Get total forms count
    const totalForms = await Form.countDocuments({ userId: user!._id });

    return NextResponse.json({
      email: user!.email,
      name: user!.name,
      image: user!.image,
      plan: user!.plan,
      creditsRemaining: user!.creditsRemaining,
      dailyLimit: getPlanLimit(user!.plan),
      lastReset: user!.lastReset,
      totalForms,
      dbConnected: true,
      dbError: null,
    });
  } catch (error: unknown) {
    console.error("User API Error:", error);
    // Fallback response if DB fails
    return NextResponse.json({
      email: "",
      name: "User",
      plan: "free",
      creditsRemaining: 800,
      dailyLimit: 800,
      lastReset: new Date(),
      dbConnected: false,
      dbError: getDBConnectionError(),
    });
  }
}
