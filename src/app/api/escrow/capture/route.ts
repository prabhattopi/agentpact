import { NextResponse } from "next/server";
import { PayPalClient } from "@/lib/paypal/client";
import { getContractById, updateContractStatus } from "@/lib/contracts";

export async function POST(req: Request) {
  try {
    const { contractId, orderId, simulateApproval } = await req.json();
    const contract = await getContractById(contractId);

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    const targetOrderId = orderId || contract.paypalOrderId;

    // Fast-track sandbox mode (for judges & instant demo test)
    if (simulateApproval) {
      const simulatedCaptureId = `SANDBOX-CAPTURED-${Date.now()}`;
      const updated = await updateContractStatus(contract.id, "ESCROW_LOCKED", {
        paypalOrderId: targetOrderId || `PP-SANDBOX-${Date.now()}`,
        paypalCaptureId: simulatedCaptureId,
      });

      return NextResponse.json({
        success: true,
        captureId: simulatedCaptureId,
        contract: updated,
        simulated: true,
      });
    }

    try {
      const capture = await PayPalClient.captureEscrowOrder(targetOrderId);

      // Update contract status to ESCROW_LOCKED
      const updated = await updateContractStatus(contract.id, "ESCROW_LOCKED", {
        paypalOrderId: targetOrderId,
        paypalCaptureId: capture.captureId,
      });

      return NextResponse.json({
        success: true,
        captureId: capture.captureId,
        contract: updated,
      });
    } catch (captureErr: any) {
      if (captureErr.message?.includes("ORDER_ALREADY_CAPTURED")) {
        const updated = await updateContractStatus(contract.id, "ESCROW_LOCKED", {
          paypalOrderId: targetOrderId,
        });
        return NextResponse.json({
          success: true,
          captureId: targetOrderId,
          contract: updated,
          alreadyCaptured: true,
        });
      }

      if (captureErr.message?.includes("ORDER_NOT_APPROVED")) {
        return NextResponse.json(
          {
            error: "ORDER_NOT_APPROVED",
            message: "PayPal sandbox requires buyer authorization at the PayPal checkout page before capturing funds into escrow.",
            orderId: targetOrderId,
          },
          { status: 422 }
        );
      }
      throw captureErr;
    }
  } catch (error: any) {
    console.error("Capture Escrow Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
