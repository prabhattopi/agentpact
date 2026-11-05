import { NextResponse } from "next/server";
import { computeDeliverableHash } from "@/lib/agents/security";
import { updateMilestoneSubmission } from "@/lib/contracts";

export async function POST(req: Request) {
  try {
    const { milestoneId, deliverableUrl, deliverableNotes } = await req.json();

    if (!milestoneId) {
      return NextResponse.json({ error: "milestoneId is required" }, { status: 400 });
    }

    const hash = computeDeliverableHash({
      milestoneId,
      deliverableUrl,
      deliverableNotes,
    });

    const updated = await updateMilestoneSubmission(milestoneId, {
      deliverableUrl,
      deliverableNotes,
      submissionHash: hash,
    });

    return NextResponse.json({
      success: true,
      submissionHash: hash,
      milestone: updated,
    });
  } catch (error: any) {
    console.error("Milestone Submission Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

