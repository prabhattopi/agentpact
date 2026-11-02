"use client";

import React, { useState } from "react";
import { ShieldAlert, X, Sparkles, Scale, Loader2, ArrowRight } from "lucide-react";

interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestone: any;
  contract: any;
  onResolved: () => void;
}

export function DisputeModal({
  isOpen,
  onClose,
  milestone,
  contract,
  onResolved,
}: DisputeModalProps) {
  const [clientReason, setClientReason] = useState(
    "The code delivered fails to pass unit tests and the database schema does not include foreign key constraints specified in criteria."
  );
  const [devCounter, setDevCounter] = useState(
    "All core tables and endpoints are implemented. Missing tests were due to mock database driver differences."
  );
  const [arbitrating, setArbitrating] = useState(false);
  const [resolution, setResolution] = useState<any>(null);

  if (!isOpen || !milestone) return null;

  const handleArbitrate = async () => {
    setArbitrating(true);
    try {
      const res = await fetch("/api/disputes/arbitrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractId: contract.id,
          milestoneId: milestone.id,
          clientReason,
          devCounter,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResolution(data);
    } catch (err: any) {
      alert("Arbitration failed: " + err.message);
    } finally {
      setArbitrating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Autonomous Dispute Arbitrator</h3>
              <p className="text-xs text-zinc-400">Impartial AI Mediation with Binding Settlement Terms</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs flex justify-between items-center">
            <div>
              <span className="text-zinc-400">Disputed Milestone:</span>
              <span className="ml-2 font-semibold text-white">{milestone.title}</span>
            </div>
            <span className="font-bold text-emerald-400">${milestone.amount} USD</span>
          </div>

          {!resolution ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Client Grievance / Non-Compliance Claim
                </label>
                <textarea
                  value={clientReason}
                  onChange={(e) => setClientReason(e.target.value)}
                  rows={3}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Freelancer Counter-Claim / Defense
                </label>
                <textarea
                  value={devCounter}
                  onChange={(e) => setDevCounter(e.target.value)}
                  rows={3}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleArbitrate}
                disabled={arbitrating}
                className="w-full py-3 bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:opacity-95 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 disabled:opacity-50 cursor-pointer"
              >
                {arbitrating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Synthesizing Contract Specs & Delivering Binding Resolution...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Execute Autonomous AI Arbitration
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                    Decision: {resolution.decision}
                  </span>
                  <span className="text-xs font-semibold text-zinc-300">
                    Confidence: {Math.round(resolution.confidenceScore * 100)}%
                  </span>
                </div>

                {/* Monetary split */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-center">
                    <span className="text-[10px] text-zinc-400 block">Refund to Client (PayPal)</span>
                    <span className="text-lg font-bold text-rose-400">${resolution.refundAmount} USD</span>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-center">
                    <span className="text-[10px] text-zinc-400 block">Release to Freelancer (Payouts)</span>
                    <span className="text-lg font-bold text-emerald-400">${resolution.releaseAmount} USD</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <span className="font-semibold text-zinc-300">Arbitrator Rationale:</span>
                <p className="text-zinc-400 leading-relaxed bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                  {resolution.analysis}
                </p>
              </div>

              {resolution.bindingTerms && (
                <div className="space-y-1.5 text-xs">
                  <span className="font-semibold text-zinc-300">Binding Execution Terms:</span>
                  <ul className="space-y-1 text-zinc-400">
                    {resolution.bindingTerms.map((term: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-purple-400">•</span>
                        <span>{term}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={() => {
                  onResolved();
                  onClose();
                }}
                className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium rounded-xl transition-colors cursor-pointer"
              >
                Close & Return to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
