"use client";

import React, { useState } from "react";
import {
  X,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  DollarSign,
  CheckCircle2,
  Clock,
  Loader2,
  Code2,
  FileCheck,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import confetti from "canvas-confetti";

interface MilestoneDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  milestone: any;
  contract: any;
  activeRole: "CLIENT" | "FREELANCER";
  onUpdated: () => void;
  onRaiseDispute: (milestone: any) => void;
}

export function MilestoneDrawer({
  isOpen,
  onClose,
  milestone,
  contract,
  activeRole,
  onUpdated,
  onRaiseDispute,
}: MilestoneDrawerProps) {
  const [activeTab, setActiveTab] = useState<"audit" | "submit" | "payout">("audit");
  const [deliverableUrl, setDeliverableUrl] = useState(milestone?.deliverableUrl || "");
  const [deliverableNotes, setDeliverableNotes] = useState(milestone?.deliverableNotes || "");
  const [codeDiff, setCodeDiff] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [releasing, setReleasing] = useState(false);
  const [latestAudit, setLatestAudit] = useState<any>(
    milestone?.audits && milestone.audits.length > 0 ? milestone.audits[0] : null
  );

  if (!isOpen || !milestone) return null;

  let criteria: any[] = [];
  try {
    criteria = JSON.parse(milestone.acceptanceCriteria || "[]");
  } catch {
    criteria = [];
  }

  const isEscrowLocked = contract?.status === "ESCROW_LOCKED" || contract?.status === "IN_PROGRESS";
  const isPaid = milestone.status === "PAID";
  const isSubmitted = milestone.status === "SUBMITTED";

  // Step 1: Submit Work
  const handleSubmitWork = async () => {
    if (!deliverableUrl && !deliverableNotes) {
      alert("Please provide deliverable URL or implementation notes.");
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
      setActiveTab("audit");
    } catch (err: any) {
      alert("Submission error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2: Autonomous Verification
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
      onUpdated();
    } catch (err: any) {
      alert("Verification error: " + err.message);
    } finally {
      setVerifying(false);
    }
  };

  // Step 3: Payout Release
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

      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
      onUpdated();
      onClose();
    } catch (err: any) {
      alert("Payout release failed: " + err.message);
    } finally {
      setReleasing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl h-full bg-zinc-900 border-l border-zinc-800 flex flex-col shadow-2xl animate-in slide-in-from-right duration-250">
        {/* Drawer Header */}
        <div className="p-6 border-b border-zinc-800 bg-zinc-950/80 flex items-start justify-between">
          <div className="space-y-1 pr-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
                Milestone #{milestone.orderIndex}
              </span>
              {isPaid ? (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Paid via PayPal
                </span>
              ) : isSubmitted ? (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Submitted
                </span>
              ) : (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                  Pending Work
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">{milestone.title}</h3>
            <p className="text-xs text-zinc-400">{milestone.description}</p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center border-b border-zinc-800 bg-zinc-950/40 px-6 gap-6 text-xs">
          <button
            onClick={() => setActiveTab("audit")}
            className={`py-3 font-medium transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === "audit"
                ? "border-blue-500 text-blue-400 font-semibold"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            AI Audit & Rubric
          </button>

          <button
            onClick={() => setActiveTab("submit")}
            className={`py-3 font-medium transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === "submit"
                ? "border-blue-500 text-blue-400 font-semibold"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Deliverables
          </button>

          <button
            onClick={() => setActiveTab("payout")}
            className={`py-3 font-medium transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === "payout"
                ? "border-blue-500 text-blue-400 font-semibold"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            PayPal Settlement
          </button>
        </div>

        {/* Drawer Scrollable Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5">
          {/* TAB 1: AI AUDIT & RUBRIC */}
          {activeTab === "audit" && (
            <div className="space-y-4">
              {/* Score Card */}
              {latestAudit ? (
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-300">Gemini 2.5 Flash Audit Verdict</span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        latestAudit.overallScore >= 80
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      Score: {latestAudit.overallScore} / 100
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">{latestAudit.summary}</p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-center py-6 text-xs text-zinc-400">
                  <Sparkles className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  No verification run yet. Submit deliverables to trigger autonomous audit.
                </div>
              )}

              {/* Acceptance Criteria Breakdown */}
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase text-zinc-400 tracking-wider">
                  Verifiable Criteria Rubric ({criteria.length})
                </span>

                <div className="space-y-2">
                  {criteria.map((c: any, idx: number) => {
                    const auditCriterion = latestAudit?.criteriaResults?.find(
                      (r: any) => r.criterionId === c.id || r.description === c.description
                    );

                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs space-y-1.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-medium text-white">{c.description}</span>
                          {auditCriterion ? (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                                auditCriterion.satisfied
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              }`}
                            >
                              {auditCriterion.satisfied ? "PASS" : "FAIL"}
                            </span>
                          ) : (
                            <span className="text-[10px] text-zinc-500 uppercase">Weight {c.weight}/5</span>
                          )}
                        </div>

                        {auditCriterion?.reasoning && (
                          <p className="text-[11px] text-zinc-400">{auditCriterion.reasoning}</p>
                        )}

                        {auditCriterion?.evidenceFound && auditCriterion.evidenceFound !== "None" && (
                          <div className="text-[10px] font-mono text-cyan-300/80 bg-zinc-900 p-1.5 rounded">
                            Evidence: {auditCriterion.evidenceFound}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 flex items-center gap-3">
                <button
                  onClick={handleVerify}
                  disabled={verifying}
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Gemini Auditing Code & Tests...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Run Autonomous AI Verification
                    </>
                  )}
                </button>

                {activeRole === "CLIENT" && !isPaid && (
                  <button
                    onClick={() => {
                      onRaiseDispute(milestone);
                      onClose();
                    }}
                    className="px-3 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-medium rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Raise Dispute
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: DELIVERABLES */}
          {activeTab === "submit" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Deliverable Artifact URL (GitHub PR / Preview)
                </label>
                <input
                  type="text"
                  placeholder="https://github.com/my-org/project/pull/12"
                  value={deliverableUrl}
                  onChange={(e) => setDeliverableUrl(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Developer Implementation Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Details of test coverage, endpoints built, and deployment hashes..."
                  value={deliverableNotes}
                  onChange={(e) => setDeliverableNotes(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Optional Code Snippet / Git Diff for Direct Verification
                </label>
                <textarea
                  rows={4}
                  placeholder="Paste git diff or critical functions..."
                  value={codeDiff}
                  onChange={(e) => setCodeDiff(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs font-mono text-zinc-300 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleSubmitWork}
                disabled={submitting}
                className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save & Hash Deliverable"}
              </button>
            </div>
          )}

          {/* TAB 3: PAYPAL SETTLEMENT */}
          {activeTab === "payout" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Milestone Value:</span>
                  <span className="text-lg font-bold text-emerald-400">${milestone.amount} USD</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-2 border-t border-zinc-900">
                  <span className="text-zinc-400">Escrow Hold Status:</span>
                  <span className="text-xs font-semibold text-blue-400">
                    {isEscrowLocked ? "🟢 Funded in PayPal Escrow" : "🟡 Pending Client Authorization"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs pt-2 border-t border-zinc-900">
                  <span className="text-zinc-400">Recipient PayPal Email:</span>
                  <span className="text-xs font-mono text-cyan-300">
                    {contract.freelancer?.paypalEmail || contract.freelancer?.email}
                  </span>
                </div>
              </div>

              {isPaid ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Payout Dispatched via PayPal Payouts API v1</span>
                  </div>
                  <p className="text-zinc-400">
                    Batch ID: <span className="font-mono text-white">{milestone.payoutBatchId}</span>
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={handleClaimPayout}
                    disabled={releasing || !latestAudit?.passed || !isEscrowLocked}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-40"
                  >
                    {releasing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Dispatching PayPal Instant Payout...
                      </>
                    ) : (
                      <>
                        <DollarSign className="w-4 h-4" />
                        Release ${milestone.amount} via PayPal Payout
                      </>
                    )}
                  </button>

                  {(!latestAudit?.passed || !isEscrowLocked) && (
                    <p className="text-[11px] text-zinc-500 text-center">
                      {!isEscrowLocked
                        ? "Client must first lock escrow funds before payout can be released."
                        : "AI Verification must score >= 80% to unlock instant payout."}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
