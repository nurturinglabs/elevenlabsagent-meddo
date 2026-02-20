import Link from "next/link";
import {
  Stethoscope,
  Mic,
  Brain,
  CalendarCheck,
  Users,
  BarChart3,
  ArrowRight,
  MessageSquare,
  FileText,
  Bell,
  ChevronRight,
  Zap,
  Shield,
  Clock,
} from "lucide-react";

const features = [
  {
    icon: Mic,
    title: "Voice-First Clinical Notes",
    description:
      "Dictate SOAP notes hands-free. AI structures your speech into professional clinical documentation in real-time.",
  },
  {
    icon: Brain,
    title: "AI Pattern Detection",
    description:
      "Automatically flags rising HbA1c, drug interactions, missed labs, and deteriorating vitals across patient history.",
  },
  {
    icon: CalendarCheck,
    title: "Smart Scheduling",
    description:
      "Book appointments by voice. Weekly calendar view with color-coded types, click-to-view patient details.",
  },
  {
    icon: MessageSquare,
    title: "One-Click Follow-ups",
    description:
      "Send personalized follow-up messages via email or SMS. Record messages by voice or type them out.",
  },
  {
    icon: FileText,
    title: "Instant Patient Summaries",
    description:
      "AI synthesizes visit history, medications, conditions, and trends into a concise briefing before each consultation.",
  },
  {
    icon: BarChart3,
    title: "Practice Analytics",
    description:
      "Daily, weekly, and monthly views of appointment volume, no-show rates, peak hours, and clinical insights.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">Meddo</span>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
          >
            Try Live Demo
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-6 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          {/* Centered Hero Text */}
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 mb-6">
              <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span className="text-xs font-medium text-teal-700">Powered by ElevenLabs Voice AI</span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 leading-[1.08] tracking-tight">
              The AI clinical assistant
              <br />
              that gives doctors a{" "}
              <span className="relative">
                <span className="text-teal-600">superpower</span>
                <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 8" fill="none">
                  <path d="M2 6C50 2 150 2 198 6" stroke="#0d9488" strokeWidth="3" strokeLinecap="round" opacity="0.3" />
                </svg>
              </span>
            </h1>
            <p className="mt-6 text-lg text-slate-500 leading-relaxed max-w-2xl mx-auto">
              Dictate notes by voice. Get AI-powered patient summaries. Detect clinical patterns.
              Send follow-ups in one click. All from a single screen.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/25 hover:shadow-xl hover:shadow-teal-600/30"
              >
                Open Live Demo
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#flow"
                className="inline-flex items-center gap-1.5 px-5 py-3.5 text-slate-600 font-medium hover:text-teal-600 transition-colors border border-slate-200 rounded-xl hover:border-teal-200"
              >
                See how it works
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Hero Flow Visual — Horizontal Pipeline */}
          <div className="mt-20 relative">
            <div className="grid grid-cols-4 gap-0 items-start">
              {/* Step 1: Patient Walks In */}
              <div className="relative text-center px-3">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/25">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div className="absolute top-8 left-[calc(50%+40px)] w-[calc(100%-40px)] h-[1px]">
                  <div className="h-full bg-gradient-to-r from-blue-300 to-teal-300" />
                  <ChevronRight className="w-4 h-4 text-teal-400 absolute -right-2 -top-2" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-4">Patient Walks In</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Click from your calendar. Full patient context loads instantly — history, meds, alerts.
                </p>
              </div>

              {/* Step 2: AI Briefs You */}
              <div className="relative text-center px-3">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center mx-auto shadow-lg shadow-teal-500/25">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <div className="absolute top-8 left-[calc(50%+40px)] w-[calc(100%-40px)] h-[1px]">
                  <div className="h-full bg-gradient-to-r from-teal-300 to-amber-300" />
                  <ChevronRight className="w-4 h-4 text-amber-400 absolute -right-2 -top-2" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-4">AI Briefs You</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Voice summary of visit history, recent labs, medications, and pattern alerts before you start.
                </p>
              </div>

              {/* Step 3: You Consult & Dictate */}
              <div className="relative text-center px-3">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/25">
                  <Mic className="w-7 h-7 text-white" />
                </div>
                <div className="absolute top-8 left-[calc(50%+40px)] w-[calc(100%-40px)] h-[1px]">
                  <div className="h-full bg-gradient-to-r from-amber-300 to-emerald-300" />
                  <ChevronRight className="w-4 h-4 text-emerald-400 absolute -right-2 -top-2" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-4">Consult & Dictate</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Focus on the patient. Speak naturally — AI structures your words into SOAP notes in real-time.
                </p>
              </div>

              {/* Step 4: Done */}
              <div className="relative text-center px-3">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/25">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-4">Done. Sent. Saved.</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Notes filed. Follow-up reminders scheduled. Prescriptions and messages sent — one click.
                </p>
              </div>
            </div>

            {/* Output cards below the flow */}
            <div className="mt-12 grid grid-cols-3 gap-4">
              {/* SOAP Note Output */}
              <div className="rounded-xl bg-slate-900 p-5 shadow-xl">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-teal-400" />
                  <span className="text-[11px] font-semibold text-teal-400 uppercase tracking-wider">SOAP Note — Auto-generated</span>
                </div>
                <div className="space-y-2.5">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Subjective</p>
                    <p className="text-xs text-slate-300 leading-relaxed">Patient reports increased fatigue, polyuria, and thirst over 2 weeks. Irregular medication compliance due to GI side effects.</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Objective</p>
                    <p className="text-xs text-slate-300 leading-relaxed">BP 148/92 mmHg, Weight 78kg, HbA1c 8.2% (prev 7.1%)</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Plan</p>
                    <p className="text-xs text-slate-300 leading-relaxed">Switch to Metformin ER. Add Glimepiride 1mg. Recheck in 4 weeks.</p>
                  </div>
                </div>
              </div>

              {/* AI Pattern Alert */}
              <div className="rounded-xl bg-slate-900 p-5 shadow-xl">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="text-[11px] font-semibold text-red-400 uppercase tracking-wider">AI Pattern Alert</span>
                </div>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-xs font-semibold text-red-300">HbA1c rising: 7.1% → 8.2% in 5 weeks</p>
                    <p className="text-[11px] text-red-400/80 mt-1">Glycemic control deteriorating. Consider medication adjustment.</p>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <p className="text-xs font-semibold text-amber-300">BP above 140/90 across 2 visits</p>
                    <p className="text-[11px] text-amber-400/80 mt-1">Add second antihypertensive or increase Amlodipine.</p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <p className="text-xs font-semibold text-blue-300">Renal function tests pending</p>
                    <p className="text-[11px] text-blue-400/80 mt-1">Ordered Feb 10 — no results on file.</p>
                  </div>
                </div>
              </div>

              {/* Follow-up Sent */}
              <div className="rounded-xl bg-slate-900 p-5 shadow-xl">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Follow-up — Sent</span>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/80 border border-slate-700">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center">
                      <Stethoscope className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-200">Meddo Clinic</p>
                      <p className="text-[10px] text-slate-500">Patient Follow-up</p>
                    </div>
                  </div>
                  <div className="bg-slate-700/50 rounded-md p-3 border-l-2 border-teal-500">
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Dear Ramesh, this is a follow-up regarding your diabetes management. Please complete your renal function tests and schedule a visit for review. — Dr. Suresh
                    </p>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">Email Sent</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">SMS Sent</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props — Three Pillars */}
      <section id="flow" className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900">Why doctors love Meddo</h2>
            <p className="mt-3 text-slate-500 max-w-lg mx-auto">
              From patient arrival to documentation complete — in minutes, not hours.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-teal-100 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-7 h-7 text-teal-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Save 2+ Hours Daily</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Voice dictation and auto-generated SOAP notes eliminate manual documentation. Speak, don't type.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Catch What You Miss</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                AI scans patient history for rising vitals, drug interactions, missed labs, and overdue tests — automatically.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-7 h-7 text-blue-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Never Lose a Follow-up</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Send voice-recorded or typed follow-up messages via email and SMS. Track overdue patients at a glance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900">Built for How Doctors Actually Work</h2>
            <p className="mt-3 text-slate-500 max-w-lg mx-auto">
              Every feature designed to save clinical time and improve patient outcomes.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-slate-200 p-6 hover:border-teal-300 hover:shadow-lg transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center mb-4 group-hover:bg-teal-100 transition-colors">
                  <feature.icon className="w-5 h-5 text-teal-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-slate-900">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-14 h-14 rounded-2xl bg-teal-600 flex items-center justify-center mx-auto mb-6">
            <Stethoscope className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white">
            See Meddo in action
          </h2>
          <p className="mt-4 text-slate-400 max-w-md mx-auto">
            Try the full working demo with voice dictation, AI summaries,
            patient management, and smart analytics.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 mt-8 px-8 py-4 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-500 transition-all shadow-lg shadow-teal-600/30 text-lg"
          >
            Launch Demo
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-teal-600 flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-900">Meddo</span>
          </div>
          <p className="text-xs text-slate-400">
            Powered by ElevenLabs Voice AI &bull; Built by Umesh
          </p>
        </div>
      </footer>
    </div>
  );
}
