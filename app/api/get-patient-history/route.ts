import { NextRequest, NextResponse } from "next/server";
import { getPatientById, getNotesByPatient, getAppointmentsByPatient } from "@/lib/store";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { patient_id } = body;

  if (!patient_id) {
    return NextResponse.json({ error: "patient_id is required" }, { status: 400 });
  }

  const patient = getPatientById(patient_id);
  if (!patient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  const patientNotes = getNotesByPatient(patient_id);
  const patientAppointments = getAppointmentsByPatient(patient_id);

  return NextResponse.json({
    patient,
    notes: patientNotes,
    appointments: patientAppointments,
    total_visits: patientNotes.length,
    last_visit: patientNotes[0]?.date || null,
  });
}
