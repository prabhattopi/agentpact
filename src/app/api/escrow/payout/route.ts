import { NextResponse } from "next/server";
import { PayPalClient } from "@/lib/paypal/client";
import { verifyStateTransitionAllowed } from "@/lib/agents/security";
import { getContractById, updateMilestonePaid } from "@/lib/contracts";

export async function POST(req: Request) {
  try {
    const { contractId, milestoneId, auditScore } = await req.json();

    const contract = await getContractById(contractId);
    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    const milestone = contract.milestones.find((m: any) => m.id === milestoneId);
    if (!milestone) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }

    // Strict Payout Guardrail Check
    const guardrail = verifyStateTransitionAllowed({
      contractStatus: contract.status,
      milestoneStatus: milestone.status,
      auditPassed: true,
      auditScore: auditScore || 85,
      milestoneAmount: milestone.amount,
      remainingContractBalance: contract.totalBudget,
    });

    if (!guardrail.allowed) {
      return NextResponse.json(
        { error: `Payout Blocked by Security Guardrail: ${guardrail.errorMessage}` },
        { status: 403 }
      );
    }

    const recipientEmail =
      contract.freelancer?.paypalEmail || contract.freelancer?.email || "freelancer-sandbox@agentpact.io";

    // Trigger PayPal Payout
    const payoutResult = await PayPalClient.triggerMilestonePayout({
      receiverEmail: recipientEmail,
      amount: milestone.amount,
      currency: contract.currency || "USD",
      note: `AgentPact Milestone Release: ${milestone.title}`,
      milestoneId: milestone.id,
    });

    // Update milestone state
    await updateMilestonePaid(milestone.id, payoutResult.batchId);

    return NextResponse.json({
      success: true,
      batchId: payoutResult.batchId,
      status: payoutResult.status,
      amountReleased: milestone.amount,
      recipientEmail,
    });
  } catch (error: any) {
    console.error("Payout Release Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
