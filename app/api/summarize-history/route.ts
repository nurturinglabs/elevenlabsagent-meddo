import { NextRequest, NextResponse } from "next/server";
import { getSummary } from "@/lib/store";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { patient_id } = body;

  if (!patient_id) {
    return NextResponse.json({ error: "patient_id is required" }, { status: 400 });
  }

  const summary = getSummary(patient_id);
  if (!summary) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  return NextResponse.json({
    patient_name: summary.patient_name,
    summary_text: summary.summary_text,
    key_concerns: summary.key_concerns,
    last_visit_date: summary.last_visit_date,
    total_visits: summary.total_visits,
  });
}
