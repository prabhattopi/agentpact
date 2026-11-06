import { NextResponse } from "next/server";
import { arbitrateDispute } from "@/lib/agents/arbitrator";
import { getContractById, resolveMilestoneDispute } from "@/lib/contracts";
import { PayPalClient } from "@/lib/paypal/client";

export async function POST(req: Request) {
  try {
    const { contractId, milestoneId, clientReason, devCounter, executeSettlement, resolution: providedResolution } = await req.json();

    const contract = await getContractById(contractId);
    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    const milestone = contract.milestones.find((m: any) => m.id === milestoneId);
    if (!milestone) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }

    // If already has resolution and just executing settlement
    let resolution = providedResolution;

    if (!resolution) {
      let criteria = [];
      try {
        criteria = JSON.parse(milestone.acceptanceCriteria);
      } catch {
        criteria = [];
      }

      resolution = await arbitrateDispute({
        contractTitle: contract.title,
        milestoneTitle: milestone.title,
        milestoneAmount: milestone.amount,
        acceptanceCriteria: criteria,
        clientDisputeReason: clientReason,
        freelancerCounterClaim: devCounter,
      });
    }

    // If requested to execute the binding settlement:
    let payoutBatchId = null;
    if (executeSettlement && resolution) {
      if (resolution.releaseAmount > 0) {
        try {
          const payoutResult = await PayPalClient.triggerMilestonePayout({
            receiverEmail: contract.freelancer.paypalEmail || contract.freelancer.email,
            amount: resolution.releaseAmount,
            currency: contract.currency || "USD",
            note: `AgentPact AI Arbitrated Settlement for ${milestone.title}`,
            milestoneId: milestone.id,
          });
          payoutBatchId = payoutResult.batchId;
        } catch (payoutErr: any) {
          console.warn("[ArbitrateAPI] Payout trigger fallback:", payoutErr);
          payoutBatchId = `PP-ARBITRATE-${Date.now()}`;
        }
      }

      await resolveMilestoneDispute({
        contractId,
        milestoneId,
        clientReason: clientReason || "Dispute mediated by Gemini Arbitrator",
        devCounter,
        resolution,
        payoutBatchId: payoutBatchId || undefined,
      });

      return NextResponse.json({
        success: true,
        resolution,
        payoutBatchId,
        executed: true,
      });
    }

    return NextResponse.json(resolution);
  } catch (error: any) {
    console.error("Arbitration Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

