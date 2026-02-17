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
  const upcomingApts = getAppointmentsByPatient(patient_id).filter(
    (a) => a.status === "scheduled"
  );

  // Build summary from notes
  const diagnoses = patient.chronic_conditions.join(", ") || "None documented";
  const medications = patient.current_medications
    .map((m) => `${m.name} ${m.dosage} ${m.frequency}`)
    .join("; ") || "None";
  const allergies = patient.allergies.join(", ") || "None";

  const visitSummaries = patientNotes
    .slice(0, 5)
    .map((n) => `${n.date}: ${n.soap.assessment}`)
    .join("\n");

  const summary = `Patient: ${patient.name}, ${patient.age}yo ${patient.gender}
Blood Group: ${patient.blood_group}
Diagnoses: ${diagnoses}
Allergies: ${allergies}
Current Medications: ${medications}

Visit History (${patientNotes.length} visits):
${visitSummaries || "No documented visits."}

Upcoming Appointments: ${upcomingApts.length > 0 ? upcomingApts.map((a) => `${a.date} — ${a.reason}`).join("; ") : "None scheduled"}`;

  const keyConcerns: string[] = [];
  if (patientNotes.length > 0) {
    const latest = patientNotes[0];
    if (latest.soap.assessment.toLowerCase().includes("worsening")) {
      keyConcerns.push("Condition worsening — needs close monitoring");
    }
  }
  if (patient.allergies.length > 0) {
    keyConcerns.push(`Drug allergies: ${patient.allergies.join(", ")}`);
  }
  if (patient.chronic_conditions.length >= 2) {
    keyConcerns.push("Multiple chronic conditions — consider drug interactions");
  }

  return NextResponse.json({
    patient_name: patient.name,
    summary_text: summary,
    key_concerns: keyConcerns,
    last_visit_date: patientNotes[0]?.date || null,
    total_visits: patientNotes.length,
  });
}
