import { NextResponse } from "next/server";
import { scopeProjectRequirements } from "@/lib/agents/scoper";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { requirements, targetBudget } = body;

    if (!requirements || typeof requirements !== "string") {
      return NextResponse.json(
        { error: "Valid requirements text is required" },
        { status: 400 }
      );
    }

    const plan = await scopeProjectRequirements(requirements, targetBudget);
    return NextResponse.json(plan);
  } catch (error: any) {
    console.error("Scope API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to scope project requirements" },
      { status: 500 }
    );
  }
}

