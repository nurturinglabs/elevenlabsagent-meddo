import { NextRequest, NextResponse } from "next/server";
import { addNote, getPatientById } from "@/lib/store";
import { ClinicalNote } from "@/lib/types";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { patient_id, subjective, objective, assessment, plan } = body;

  if (!patient_id || !subjective || !assessment) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const patient = getPatientById(patient_id);
  if (!patient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  const note: ClinicalNote = {
    id: `note_${Date.now().toString(36)}`,
    patient_id,
    date: new Date().toISOString().split("T")[0],
    mode: "dictate",
    soap: {
      subjective: subjective || "",
      objective: objective || "",
      assessment: assessment || "",
      plan: plan || "",
    },
    created_at: new Date().toISOString(),
  };

  addNote(note);

  return NextResponse.json({
    success: true,
    note_id: note.id,
    soap: note.soap,
    message: `SOAP note saved for ${patient.name}`,
  });
}
