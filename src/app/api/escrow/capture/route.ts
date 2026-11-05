import { NextResponse } from "next/server";
import { PayPalClient } from "@/lib/paypal/client";
import { getContractById, updateContractStatus } from "@/lib/contracts";

export async function POST(req: Request) {
  try {
    const { contractId, orderId } = await req.json();
    const contract = await getContractById(contractId);

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    const capture = await PayPalClient.captureEscrowOrder(orderId || contract.paypalOrderId);

    // Update contract status to ESCROW_LOCKED
    const updated = await updateContractStatus(contract.id, "ESCROW_LOCKED", {
      paypalOrderId: orderId || contract.paypalOrderId,
      paypalCaptureId: capture.captureId,
    });

    return NextResponse.json({
      success: true,
      captureId: capture.captureId,
      contract: updated,
    });
  } catch (error: any) {
    console.error("Capture Escrow Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

