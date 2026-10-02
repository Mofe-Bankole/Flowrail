import { NextResponse } from "next/server";
import { classifyInvoice } from "@/lib/engine";

export async function POST() {
  const run = await classifyInvoice();
  return NextResponse.json(run);
}
