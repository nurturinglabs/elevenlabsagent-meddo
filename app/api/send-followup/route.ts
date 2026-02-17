import { NextRequest, NextResponse } from "next/server";
import { getPatientById } from "@/lib/store";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { patient_id, message_type = "appointment_reminder" } = body;

  if (!patient_id) {
    return NextResponse.json({ error: "patient_id is required" }, { status: 400 });
  }

  const patient = getPatientById(patient_id);
  if (!patient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  const templates: Record<string, { subject: string; body: string }> = {
    appointment_reminder: {
      subject: `Appointment Reminder — Dr. Clinic`,
      body: `Dear ${patient.name}, this is a reminder about your upcoming appointment. Please arrive 10 minutes early and bring any recent lab reports. Reply to confirm. — Dr.'s Clinic`,
    },
    lab_results: {
      subject: `Lab Results Follow-up`,
      body: `Dear ${patient.name}, your lab results are ready for review. Please schedule a visit at your earliest convenience. — Dr.'s Clinic`,
    },
    medication_check: {
      subject: `Medication Check-in`,
      body: `Dear ${patient.name}, we're checking in on your medication. How are you feeling? Any side effects? Please reply or call us. — Dr.'s Clinic`,
    },
  };

  const template = templates[message_type] || templates.appointment_reminder;

  return NextResponse.json({
    success: true,
    patient_name: patient.name,
    channel: "SMS",
    subject: template.subject,
    body: template.body,
    sent_at: new Date().toISOString(),
  });
}
