import { NextResponse } from "next/server";
import { createContract, listAllContracts } from "@/lib/contracts";

export async function GET() {
  try {
    const contracts = await listAllContracts();
    return NextResponse.json(contracts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const contract = await createContract(body);
    return NextResponse.json(contract, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
