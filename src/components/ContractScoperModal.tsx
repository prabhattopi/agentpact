"use client";

import React, { useState } from "react";
import { Sparkles, X, CheckCircle2, ArrowRight, DollarSign, Bot, Loader2 } from "lucide-react";
import { ScopedContractPlan } from "@/lib/agents/scoper";

interface ContractScoperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContractCreated: (contract: any) => void;
}

export function ContractScoperModal({
  isOpen,
  onClose,
  onContractCreated,
}: ContractScoperModalProps) {
  const [requirements, setRequirements] = useState(
    "Build a production Next.js 16 analytics dashboard with AG Grid data tables, PayPal Escrow webhook integration, and automated Jest test coverage exceeding 85%."
  );
  const [budget, setBudget] = useState(1500);
  const [freelancerEmail, setFreelancerEmail] = useState("solodev@sandbox.paypal.com");
  const [freelancerName, setFreelancerName] = useState("Devin Vance (Senior Agent Architect)");
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [scopedPlan, setScopedPlan] = useState<ScopedContractPlan | null>(null);

  if (!isOpen) return null;

  const handleGenerateScope = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/scope", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requirements,
          targetBudget: Number(budget),
        }),
      });
      const data = await res.json();
      setScopedPlan(data);
    } catch (err) {
      console.error(err);
      alert("Failed to scope requirements");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContract = async () => {
    if (!scopedPlan) return;
    setSaving(true);
    try {
      const res = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: scopedPlan.title,
          description: scopedPlan.description,
          category: scopedPlan.category,
          totalBudget: scopedPlan.totalBudget,
          currency: scopedPlan.currency,
          clientEmail: "client-enterprise@sandbox.paypal.com",
          clientName: "Acme Corp (Client)",
          freelancerEmail: freelancerEmail,
          freelancerName: freelancerName,
          milestones: scopedPlan.milestones,
        }),
      });
      const contract = await res.json();
      onContractCreated(contract);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to create contract");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">AI Contract Scoper & Milestone Architect</h3>
              <p className="text-xs text-zinc-400">Powered by Gemini 2.5 Flash with Objective Proof Rubrics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Step 1: Input Requirements */}
          {!scopedPlan ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Raw Project Requirements / PRD
                </label>
                <textarea
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  rows={4}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  placeholder="Describe what you want the developer/agent to build..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Total Budget ($ USD)
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-9 pr-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Freelancer Name / Team
                  </label>
                  <input
                    type="text"
                    value={freelancerName}
                    onChange={(e) => setFreelancerName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Freelancer PayPal Email
                  </label>
                  <input
                    type="email"
                    value={freelancerEmail}
                    onChange={(e) => setFreelancerEmail(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleGenerateScope}
                  disabled={loading || !requirements}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:opacity-95 text-white font-medium rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing Specs & Architecting Milestones with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Architect Milestones & Rubric with AI
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Step 2: Review Generated Milestones */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-base font-semibold text-white">{scopedPlan.title}</h4>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    ${scopedPlan.totalBudget} {scopedPlan.currency}
                  </span>
                </div>
                <p className="text-xs text-zinc-400">{scopedPlan.description}</p>
              </div>

              <div className="space-y-3">
                <h5 className="text-xs font-semibold uppercase text-zinc-400 tracking-wider">
                  Generated Verifiable Milestones ({scopedPlan.milestones.length})
                </h5>

                {scopedPlan.milestones.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
                          M{idx + 1}
                        </span>
                        <span className="text-sm font-semibold text-zinc-100">{m.title}</span>
                      </div>
                      <span className="text-xs font-bold text-zinc-300">${m.amount} USD</span>
                    </div>

                    <p className="text-xs text-zinc-400">{m.description}</p>

                    {/* Criteria tags */}
                    <div className="pt-1 flex flex-wrap gap-1.5">
                      {m.acceptanceCriteria.map((crit, cIdx) => (
                        <div
                          key={cIdx}
                          className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300"
                        >
                          <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                          <span>{crit.description}</span>
                          <span className="text-[9px] text-zinc-500 uppercase">({crit.type})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  onClick={() => setScopedPlan(null)}
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-xl transition-colors cursor-pointer"
                >
                  Back to Edit
                </button>

                <button
                  onClick={handleCreateContract}
                  disabled={saving}
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 cursor-pointer"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating Contract...
                    </>
                  ) : (
                    <>
                      <span>Lock Contract & Prepare PayPal Escrow</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

