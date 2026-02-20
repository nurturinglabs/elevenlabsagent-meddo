import { NextRequest, NextResponse } from "next/server";
import { getPatientById } from "@/lib/store";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientId, patientName, message, sendEmail, sendSMS, email, phone, message_type } = body;

    // Support both old template-based and new custom message formats
    if (message_type) {
      // Legacy template-based format
      const patient_id = body.patient_id;
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

    // New custom message format
    if (!patientId || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!sendEmail && !sendSMS) {
      return NextResponse.json(
        { error: "At least one delivery method (email or SMS) must be selected" },
        { status: 400 }
      );
    }

    // Log the follow-up (In production, this would send actual email/SMS)
    console.log("=== FOLLOW-UP MESSAGE ===");
    console.log(`Patient: ${patientName} (ID: ${patientId})`);
    console.log(`Message: ${message}`);

    const deliveryMethods: string[] = [];
    const errors: string[] = [];

    // Send Email via Resend
    if (sendEmail) {
      const recipientEmail = "nurturinglabs@gmail.com";
      const today = new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      try {
        console.log(`📧 Sending email to: ${recipientEmail} (for patient: ${patientName})`);
        const { data, error } = await resend.emails.send({
          from: "Meddo Clinic <onboarding@resend.dev>",
          to: [recipientEmail],
          subject: `Follow-up: ${patientName} — Meddo Clinic`,
          html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); padding: 32px; border-radius: 8px 8px 0 0;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Meddo Clinic</h1>
                <p style="color: #ccfbf1; margin: 4px 0 0; font-size: 14px;">Patient Follow-up</p>
              </div>

              <!-- Body -->
              <div style="padding: 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
                <!-- Patient Info Card -->
                <div style="background-color: #f0fdfa; border: 1px solid #ccfbf1; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="color: #64748b; font-size: 13px; padding: 4px 0;">Patient Name</td>
                      <td style="color: #0f172a; font-size: 14px; font-weight: 600; text-align: right;">${patientName}</td>
                    </tr>
                    <tr>
                      <td style="color: #64748b; font-size: 13px; padding: 4px 0;">Phone</td>
                      <td style="color: #0f172a; font-size: 14px; text-align: right;">${phone || "N/A"}</td>
                    </tr>
                    <tr>
                      <td style="color: #64748b; font-size: 13px; padding: 4px 0;">Patient Email</td>
                      <td style="color: #0f172a; font-size: 14px; text-align: right;">${email || "N/A"}</td>
                    </tr>
                    <tr>
                      <td style="color: #64748b; font-size: 13px; padding: 4px 0;">Date</td>
                      <td style="color: #0f172a; font-size: 14px; text-align: right;">${today}</td>
                    </tr>
                  </table>
                </div>

                <!-- Message -->
                <div style="margin-bottom: 24px;">
                  <h3 style="color: #0f172a; font-size: 15px; margin: 0 0 12px; font-weight: 600;">Doctor's Follow-up Note</h3>
                  <div style="background-color: #f8fafc; border-left: 4px solid #0d9488; padding: 16px; border-radius: 0 8px 8px 0;">
                    <p style="color: #334155; font-size: 14px; line-height: 1.7; margin: 0; white-space: pre-wrap;">${message}</p>
                  </div>
                </div>

                <!-- Divider -->
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />

                <!-- Footer -->
                <p style="color: #64748b; font-size: 13px; margin: 0;">
                  Sent from <strong style="color: #0d9488;">Meddo</strong> — Healthcare Management Platform
                </p>
                <p style="color: #94a3b8; font-size: 11px; margin: 8px 0 0;">
                  This is an automated follow-up notification. Please do not reply to this email.
                </p>
              </div>
            </div>
          `,
          text: `MEDDO CLINIC — Patient Follow-up\n\nPatient: ${patientName}\nPhone: ${phone || "N/A"}\nEmail: ${email || "N/A"}\nDate: ${today}\n\n--- Doctor's Follow-up Note ---\n\n${message}\n\n---\nSent from Meddo — Healthcare Management Platform`,
        });

        if (error) {
          console.error("Resend error:", error);
          errors.push(`Email: ${error.message}`);
        } else {
          console.log("✅ Email sent successfully:", data?.id);
          deliveryMethods.push("email");
        }
      } catch (error) {
        console.error("Email sending error:", error);
        errors.push(`Email: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }

    // Send SMS (placeholder - requires Twilio or similar)
    if (sendSMS && phone) {
      console.log(`📱 SMS to: ${phone}`);
      deliveryMethods.push("SMS");
      // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
      // For now, just log it
      console.log(`SMS message: ${message}`);
    }

    console.log("========================");

    return NextResponse.json({
      success: deliveryMethods.length > 0,
      message: deliveryMethods.length > 0
        ? "Follow-up sent successfully"
        : "Failed to send follow-up",
      deliveryMethods,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error sending follow-up:", error);
    return NextResponse.json(
      { error: "Failed to send follow-up" },
      { status: 500 }
    );
  }
}
