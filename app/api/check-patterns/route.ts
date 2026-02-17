import { NextRequest, NextResponse } from "next/server";
import { getPatternAlerts } from "@/lib/store";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { patient_id } = body;

  const alerts = getPatternAlerts(patient_id || "all");

  return NextResponse.json({
    alerts,
    total: alerts.length,
    critical: alerts.filter((a) => a.severity === "critical").length,
    warnings: alerts.filter((a) => a.severity === "warning").length,
    info: alerts.filter((a) => a.severity === "info").length,
  });
}
