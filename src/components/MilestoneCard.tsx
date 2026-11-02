"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  DollarSign,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import confetti from "canvas-confetti";
import { MilestoneStatus } from "@/types";

interface MilestoneCardProps {
  milestone: any;
  contract: any;
  userRole: "CLIENT" | "FREELANCER";
  onUpdated: () => void;
  onRaiseDispute?: (milestone: any) => void;
}

export function MilestoneCard({
  milestone,
  contract,
  userRole,
  onUpdated,
  onRaiseDispute,
}: MilestoneCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [deliverableUrl, setDeliverableUrl] = useState(milestone.deliverableUrl || "");
  const [deliverableNotes, setDeliverableNotes] = useState(milestone.deliverableNotes || "");
  const [codeDiff, setCodeDiff] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [releasing, setReleasing] = useState(false);
  const [latestAudit, setLatestAudit] = useState<any>(
    milestone.audits && milestone.audits.length > 0 ? milestone.audits[0] : null
  );

  let criteria: any[] = [];
  try {
    criteria = JSON.parse(milestone.acceptanceCriteria || "[]");
  } catch {
    criteria = [];
  }

  const isEscrowLocked = contract.status === "ESCROW_LOCKED" || contract.status === "IN_PROGRESS";
  const isPaid = milestone.status === "PAID";
  const isSubmitted = milestone.status === "SUBMITTED";

  // Step 1: Freelancer submits deliverable
  const handleSubmitDeliverable = async () => {
    if (!deliverableUrl && !deliverableNotes) {
      alert("Please provide a deliverable URL (GitHub PR) or notes.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/milestones/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          milestoneId: milestone.id,
          deliverableUrl,
          deliverableNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onUpdated();
    } catch (err: any) {
      alert("Submission error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2: Trigger Autonomous AI Verification
  const handleVerify = async () => {
    setVerifying(true);
    try {
      const res = await fetch("/api/milestones/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractId: contract.id,
          milestoneId: milestone.id,
          codeSnippetOrDiff: codeDiff,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setLatestAudit(data.auditResult);
      setExpanded(true);
      onUpdated();
    } catch (err: any) {
      alert("Verification error: " + err.message);
    } finally {
      setVerifying(false);
    }
  };

  // Step 3: Trigger Instant PayPal Payout
  const handleClaimPayout = async () => {
    setReleasing(true);
    try {
      const res = await fetch("/api/escrow/payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractId: contract.id,
          milestoneId: milestone.id,
          auditScore: latestAudit?.overallScore || 90,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Celebrate with confetti!
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
      });

      onUpdated();
    } catch (err: any) {
      alert("Payout release error: " + err.message);
    } finally {
      setReleasing(false);
    }
  };

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
        isPaid
          ? "bg-zinc-950/90 border-emerald-500/30 shadow-lg shadow-emerald-500/5"
          : "bg-zinc-900/90 border-zinc-800 hover:border-zinc-700"
      }`}
    >
      {/* Top Banner Status */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
                Milestone #{milestone.orderIndex}
              </span>

              {isPaid ? (
                <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" />
                  Paid via PayPal Payouts
                </span>
              ) : isSubmitted ? (
                <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Clock className="w-3 h-3" />
                  Submitted & Pending Verification
                </span>
              ) : (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                  Pending Work
                </span>
              )}
            </div>

            <h4 className="text-base font-semibold text-white tracking-tight">{milestone.title}</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">{milestone.description}</p>
          </div>

          <div className="text-right">
            <div className="text-lg font-bold text-white tracking-tight">${milestone.amount} USD</div>
            <p className="text-[10px] text-zinc-500">Milestone Value</p>
          </div>
        </div>

        {/* Criteria Checklist */}
        <div className="mt-4 pt-4 border-t border-zinc-800/80 space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Acceptance Criteria Rubric ({criteria.length})
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {criteria.map((c: any, idx: number) => (
              <div
                key={idx}
                className="flex items-start gap-2 p-2 rounded-lg bg-zinc-950/50 border border-zinc-800/60 text-xs text-zinc-300"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-zinc-200">{c.description}</span>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-zinc-500">
                    <span>Weight: {c.weight}/5</span>
                    <span>{c.required ? "• Required" : "• Optional"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deliverable Section (If Submitted) */}
        {milestone.deliverableUrl && (
          <div className="mt-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs space-y-1">
            <div className="flex items-center justify-between text-zinc-400 text-[11px]">
              <span className="font-medium">Submitted Deliverable Artifact:</span>
              {milestone.submissionHash && (
                <span className="font-mono text-[9px] text-zinc-500">
                  SHA256: {milestone.submissionHash.slice(0, 12)}...
                </span>
              )}
            </div>
            <a
              href={milestone.deliverableUrl}
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-mono text-xs break-all"
            >
              <ExternalLink className="w-3 h-3" />
              {milestone.deliverableUrl}
            </a>
            {milestone.deliverableNotes && (
              <p className="text-zinc-300 text-xs mt-1 pt-1 border-t border-zinc-900">
                "{milestone.deliverableNotes}"
              </p>
            )}
          </div>
        )}

        {/* Audit Result Display */}
        {latestAudit && (
          <div className="mt-4 p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck
                  className={`w-4 h-4 ${
                    latestAudit.passed ? "text-emerald-400" : "text-amber-400"
                  }`}
                />
                <span className="text-xs font-semibold text-white">AI Autonomous Audit Result</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">Score:</span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded ${
                    latestAudit.overallScore >= 80
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  }`}
                >
                  {latestAudit.overallScore}/100
                </span>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">{latestAudit.summary}</p>

            <button
              onClick={() => setExpanded(!expanded)}
              className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
            >
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {expanded ? "Hide Detailed Criteria Verification" : "View Detailed Verification Evidence"}
            </button>

            {expanded && latestAudit.criteriaResults && (
              <div className="space-y-2 pt-2 border-t border-zinc-900">
                {latestAudit.criteriaResults.map((res: any, idx: number) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-zinc-900/60 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-zinc-200">{res.description}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          res.satisfied
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-rose-500/20 text-rose-400"
                        }`}
                      >
                        {res.satisfied ? "PASSED" : "FAILED"}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400">{res.reasoning}</p>
                    {res.evidenceFound && res.evidenceFound !== "None" && (
                      <p className="text-[10px] font-mono text-cyan-300/80">
                        Evidence: {res.evidenceFound}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Controls for Freelancer Role */}
        {userRole === "FREELANCER" && !isPaid && (
          <div className="mt-4 pt-4 border-t border-zinc-800 space-y-3">
            {!isSubmitted ? (
              <div className="space-y-2.5">
                <span className="text-xs font-semibold text-zinc-300">Submit Milestone Work</span>
                <input
                  type="text"
                  placeholder="Deliverable URL (e.g. GitHub PR, preview link, commit URL)..."
                  value={deliverableUrl}
                  onChange={(e) => setDeliverableUrl(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <textarea
                  placeholder="Developer implementation notes & verification instructions..."
                  value={deliverableNotes}
                  onChange={(e) => setDeliverableNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={handleSubmitDeliverable}
                  disabled={submitting}
                  className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Submit Deliverables"}
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleVerify}
                  disabled={verifying}
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Gemini 2.5 Flash Verifying Code & Tests...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Run Autonomous AI Verification
                    </>
                  )}
                </button>

                {latestAudit?.passed && isEscrowLocked && (
                  <button
                    onClick={handleClaimPayout}
                    disabled={releasing}
                    className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                  >
                    {releasing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Dispatching PayPal Payout...
                      </>
                    ) : (
                      <>
                        <DollarSign className="w-4 h-4" />
                        Claim ${milestone.amount} via PayPal Payout
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action Controls for Client Role */}
        {userRole === "CLIENT" && !isPaid && (
          <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
            <span className="text-xs text-zinc-400">
              {isSubmitted
                ? "Freelancer submitted work. AI verification can audit anytime."
                : "Waiting for freelancer deliverable submission."}
            </span>

            {onRaiseDispute && (
              <button
                onClick={() => onRaiseDispute(milestone)}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                Raise Dispute / AI Arbitration
              </button>
            )}
          </div>
        )}

        {/* Paid receipt details */}
        {isPaid && (
          <div className="mt-3 pt-3 border-t border-emerald-500/20 flex items-center justify-between text-xs text-zinc-400 font-mono">
            <span>PayPal Payout Batch ID:</span>
            <span className="text-emerald-400 font-semibold">{milestone.payoutBatchId || "BATCH_SIM_8829"}</span>
          </div>
        )}
      </div>
    </div>
  );
}
