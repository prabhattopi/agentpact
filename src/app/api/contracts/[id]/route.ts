import { NextResponse } from "next/server";
import { getContractById } from "@/lib/contracts";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contract = await getContractById(id);
    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }
    return NextResponse.json(contract);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

