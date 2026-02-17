import { NextRequest, NextResponse } from "next/server";
import { addAppointment, getPatientById } from "@/lib/store";
import { Appointment } from "@/lib/types";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { patient_id, patient_name, date, time, type = "follow_up", reason } = body;

  if (!patient_id || !date || !time || !reason) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const patient = getPatientById(patient_id);
  const name = patient_name || patient?.name || "Unknown";

  const apt: Appointment = {
    id: `apt_${Date.now().toString(36)}`,
    patient_id,
    patient_name: name,
    date,
    time,
    type: type as Appointment["type"],
    reason,
    status: "scheduled",
    created_at: new Date().toISOString(),
  };

  addAppointment(apt);

  return NextResponse.json({
    success: true,
    appointment_id: apt.id,
    patient_name: name,
    date,
    time,
    type,
    reason,
    message: `Appointment scheduled for ${name} on ${date} at ${time}`,
  });
}
