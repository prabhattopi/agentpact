import { NextResponse } from "next/server";
import { PayPalClient } from "@/lib/paypal/client";
import { getContractById, updateContractStatus } from "@/lib/contracts";

export async function POST(req: Request) {
  try {
    const { contractId } = await req.json();
    const contract = await getContractById(contractId);

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    const order = await PayPalClient.createEscrowOrder({
      contractId: contract.id,
      amount: contract.totalBudget,
      currency: contract.currency || "USD",
      description: `AgentPact Escrow: ${contract.title}`,
    });

    await updateContractStatus(contract.id, "DRAFT", { paypalOrderId: order.id });

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("Create Escrow Order Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
