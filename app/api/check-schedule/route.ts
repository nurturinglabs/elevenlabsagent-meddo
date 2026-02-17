import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { date, time } = body;

  // Mock — always return available for demo
  return NextResponse.json({
    available: true,
    date,
    time,
    message: `The slot on ${date} at ${time} is available.`,
  });
}
