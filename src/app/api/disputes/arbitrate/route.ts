import { NextResponse } from "next/server";
import { arbitrateDispute } from "@/lib/agents/arbitrator";
import { getContractById } from "@/lib/contracts";

export async function POST(req: Request) {
  try {
    const { contractId, milestoneId, clientReason, devCounter } = await req.json();

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

    const resolution = await arbitrateDispute({
      contractTitle: contract.title,
      milestoneTitle: milestone.title,
      milestoneAmount: milestone.amount,
      acceptanceCriteria: criteria,
      clientDisputeReason: clientReason,
      freelancerCounterClaim: devCounter,
    });

    return NextResponse.json(resolution);
  } catch (error: any) {
    console.error("Arbitration Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

