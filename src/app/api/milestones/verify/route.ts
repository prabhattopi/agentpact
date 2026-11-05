import { NextResponse } from "next/server";
import { verifyMilestoneDeliverable } from "@/lib/agents/verifier";
import { verifyStateTransitionAllowed } from "@/lib/agents/security";
import { getContractById } from "@/lib/contracts";

export async function POST(req: Request) {
  try {
    const { contractId, milestoneId, codeSnippetOrDiff } = await req.json();

    const contract = await getContractById(contractId);
    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    const milestone = contract.milestones.find((m: any) => m.id === milestoneId);
    if (!milestone) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }

    let criteria = [];
    try {
      criteria = JSON.parse(milestone.acceptanceCriteria);
    } catch {
      criteria = [];
    }

    // Run Verifier AI Agent
    const auditResult = await verifyMilestoneDeliverable({
      milestoneId: milestone.id,
      milestoneTitle: milestone.title,
      acceptanceCriteria: criteria,
      deliverableUrl: milestone.deliverableUrl,
      deliverableNotes: milestone.deliverableNotes,
      codeSnippetOrDiff,
    });

    // Check Financial State Machine Safety Guardrail
    const guardrail = verifyStateTransitionAllowed({
      contractStatus: contract.status,
      milestoneStatus: milestone.status,
      auditPassed: auditResult.passed,
      auditScore: auditResult.overallScore,
      milestoneAmount: milestone.amount,
      remainingContractBalance: contract.totalBudget,
    });

    return NextResponse.json({
      auditResult,
      guardrailCheck: guardrail,
      eligibleForPayout: auditResult.passed && guardrail.allowed,
    });
  } catch (error: any) {
    console.error("Verification API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

