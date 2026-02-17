import { NextResponse } from "next/server";
import { getPatients, getNotesByPatient, getPatternAlerts } from "@/lib/store";

export async function GET() {
  const patients = getPatients();

  const enriched = patients.map((p) => {
    const patientNotes = getNotesByPatient(p.id);
    const alerts = getPatternAlerts(p.id);
    return {
      ...p,
      last_visit: patientNotes[0]?.date || null,
      total_notes: patientNotes.length,
      alert_counts: {
        critical: alerts.filter((a) => a.severity === "critical").length,
        warning: alerts.filter((a) => a.severity === "warning").length,
        info: alerts.filter((a) => a.severity === "info").length,
      },
    };
  });

  return NextResponse.json(enriched);
}
