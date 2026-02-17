import { NextRequest, NextResponse } from "next/server";
import { getPatientById, getNotesByPatient, getAppointmentsByPatient, getPatternAlerts } from "@/lib/store";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const patient = getPatientById(id);

  if (!patient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  const patientNotes = getNotesByPatient(id);
  const patientAppointments = getAppointmentsByPatient(id);
  const alerts = getPatternAlerts(id);

  return NextResponse.json({
    ...patient,
    notes: patientNotes,
    appointments: patientAppointments,
    alerts,
  });
}
