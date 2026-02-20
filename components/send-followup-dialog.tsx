"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Mic,
  MicOff,
  Mail,
  MessageSquare,
  Send,
  User,
  Phone,
  CheckCircle2,
} from "lucide-react";
import { Patient } from "@/lib/types";

interface SendFollowupDialogProps {
  patient: Patient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SendFollowupDialog({
  patient,
  open,
  onOpenChange,
}: SendFollowupDialogProps) {
  const [message, setMessage] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [sendSMS, setSendSMS] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Web Speech API
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = "";
          let interimTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + " ";
            } else {
              interimTranscript += transcript;
            }
          }

          if (finalTranscript) {
            setMessage((prev) => (prev + " " + finalTranscript).trim());
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsRecording(false);
        };

        recognitionRef.current.onend = () => {
          console.log("Speech recognition ended");
          setIsRecording(false);
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleStartRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        console.log("Started speech recognition");
      } catch (error) {
        console.error("Failed to start recording:", error);
        setIsRecording(false);
      }
    } else {
      alert("Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.");
    }
  };

  const handleStopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      console.log("Stopped speech recognition");
    }
  };

  const handleSend = async () => {
    if (!message.trim() || (!sendEmail && !sendSMS)) {
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch("/api/send-followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: patient?.id,
          patientName: patient?.name,
          message: message.trim(),
          sendEmail,
          sendSMS,
          email: patient?.email,
          phone: patient?.phone,
        }),
      });

      if (response.ok) {
        setSendSuccess(true);
        setTimeout(() => {
          setSendSuccess(false);
          onOpenChange(false);
          setMessage("");
          setSendEmail(true);
          setSendSMS(true);
        }, 2000);
      }
    } catch (error) {
      console.error("Failed to send follow-up:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    if (isRecording) {
      handleStopRecording();
    }
    setMessage("");
    setSendSuccess(false);
    onOpenChange(false);
  };

  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            Send Follow-up Message
          </DialogTitle>
        </DialogHeader>

        {sendSuccess ? (
          <div className="py-12 text-center">
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-600 dark:text-green-400" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Follow-up Sent!
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Your message has been sent to {patient.name}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Patient Info */}
            <Card className="border-teal-200 dark:border-teal-700">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-teal-700 dark:text-teal-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {patient.name}
                    </p>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                        <span className="text-slate-600 dark:text-slate-400">
                          {patient.phone}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                        <span className="text-slate-600 dark:text-slate-400">
                          {patient.email || "No email on file"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Voice Recording Button */}
            <div className="flex items-center gap-3">
              <Button
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                className={
                  isRecording
                    ? "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                    : "bg-teal-600 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-800"
                }
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-4 h-4 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    Record Message
                  </>
                )}
              </Button>
              {isRecording && (
                <Badge variant="outline" className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700">
                  <span className="animate-pulse mr-1">●</span> Recording...
                </Badge>
              )}
            </div>

            {/* Message Text */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Follow-up Message
              </label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Click 'Record Message' to dictate your follow-up, or type your message here..."
                className="min-h-[120px] dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {message.length} characters
              </p>
            </div>

            {/* Send Options */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">
                Send via:
              </label>
              <div className="flex flex-col gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="email"
                    checked={sendEmail}
                    onCheckedChange={(checked) => setSendEmail(checked as boolean)}
                    disabled={!patient.email}
                  />
                  <label
                    htmlFor="email"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 dark:text-slate-200"
                  >
                    <Mail className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    Email ({patient.email || "Not available"})
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sms"
                    checked={sendSMS}
                    onCheckedChange={(checked) => setSendSMS(checked as boolean)}
                  />
                  <label
                    htmlFor="sms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 dark:text-slate-200"
                  >
                    <MessageSquare className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    SMS ({patient.phone})
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {!sendSuccess && (
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={!message.trim() || (!sendEmail && !sendSMS) || isSending}
              className="bg-teal-600 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-800"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSending ? "Sending..." : "Send Follow-up"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
