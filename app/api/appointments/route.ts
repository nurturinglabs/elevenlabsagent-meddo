import { NextResponse } from "next/server";
import { getAppointments } from "@/lib/store";

export async function GET() {
  const appointments = getAppointments();
  return NextResponse.json({ appointments });
}
