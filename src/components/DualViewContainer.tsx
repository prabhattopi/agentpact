"use client";

import React, { useState } from "react";
import { MilestoneCard } from "./MilestoneCard";
import { ShieldCheck, CreditCard, Lock, Sparkles, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { ActiveViewMode } from "./Navbar";

interface DualViewContainerProps {
  contract: any;
  viewMode: ActiveViewMode;
  onContractUpdated: () => void;
  onRaiseDispute: (milestone: any) => void;
}

export function DualViewContainer({
  contract,
  viewMode,
  onContractUpdated,
  onRaiseDispute,
}: DualViewContainerProps) {
  const [fundingEscrow, setFundingEscrow] = useState(false);

  if (!contract) {
    return (
      <div className="text-center py-20 bg-zinc-900/40 rounded-2xl border border-zinc-800">
        <Sparkles className="w-8 h-8 text-blue-400 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-white">No Contract Selected</h3>
        <p className="text-xs text-zinc-400 mt-1">
          Use the AI Scoper above or select a contract from the AG Grid Ledger.
        </p>
      </div>
    );
  }

  const isDraft = contract.status === "DRAFT";
  const isEscrowLocked = contract.status === "ESCROW_LOCKED" || contract.status === "IN_PROGRESS";

  // Lock funds into PayPal Escrow
  const handleLockEscrow = async () => {
    setFundingEscrow(true);
    try {
      // Step 1: Create Order
      const orderRes = await fetch("/api/escrow/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractId: contract.id }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error);

      // Step 2: Capture / Lock in Escrow
      const captureRes = await fetch("/api/escrow/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractId: contract.id, orderId: orderData.id }),
      });
      const captureData = await captureRes.json();
      if (!captureRes.ok) throw new Error(captureData.error);

      onContractUpdated();
    } catch (err: any) {
      alert("Failed to lock escrow: " + err.message);
    } finally {
      setFundingEscrow(false);
    }
  };

  const showClient = viewMode === "client" || viewMode === "split";
  const showFreelancer = viewMode === "freelancer" || viewMode === "split";

  return (
    <div className="space-y-6">
      {/* Contract Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {contract.category || "Fullstack Software"}
              </span>
              <span className="text-xs text-zinc-400 font-mono">ID: {contract.id}</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">{contract.title}</h2>
            <p className="text-xs text-zinc-400 max-w-3xl leading-relaxed">{contract.description}</p>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="text-right">
              <span className="text-xs text-zinc-400 block">Total Escrow Budget</span>
              <span className="text-2xl font-extrabold text-white tracking-tight">
                ${contract.totalBudget?.toLocaleString()} {contract.currency || "USD"}
              </span>
            </div>

            {/* Escrow Lock State */}
            {isDraft ? (
              <button
                onClick={handleLockEscrow}
                disabled={fundingEscrow}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:opacity-95 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/25 cursor-pointer disabled:opacity-50"
              >
                {fundingEscrow ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Locking in PayPal Escrow...
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    Authorize & Lock Escrow via PayPal
                  </>
                )}
              </button>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                <ShieldCheck className="w-4 h-4" />
                <span>Escrow Funded & Locked in PayPal Sandbox</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Synchronized Dual Perspective Container */}
      <div
        className={`grid gap-6 ${
          viewMode === "split" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
        }`}
      >
        {/* Left Column: Client Role View */}
        {showClient && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                <span className="text-xs font-bold text-white tracking-wide">
                  CLIENT VIEW — {contract.client?.name || "Enterprise Sponsor"}
                </span>
              </div>
              <span className="text-[11px] text-zinc-400 font-mono">
                {contract.client?.email || "client@sandbox.paypal.com"}
              </span>
            </div>

            <div className="space-y-4">
              {(contract.milestones || []).map((m: any) => (
                <MilestoneCard
                  key={m.id}
                  milestone={m}
                  contract={contract}
                  userRole="CLIENT"
                  onUpdated={onContractUpdated}
                  onRaiseDispute={onRaiseDispute}
                />
              ))}
            </div>
          </div>
        )}

        {/* Right Column: Freelancer Role View */}
        {showFreelancer && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
                <span className="text-xs font-bold text-white tracking-wide">
                  FREELANCER VIEW — {contract.freelancer?.name || "AI Dev Agent"}
                </span>
              </div>
              <span className="text-[11px] text-blue-400 font-mono">
                Payout Recipient: {contract.freelancer?.paypalEmail || contract.freelancer?.email}
              </span>
            </div>

            <div className="space-y-4">
              {(contract.milestones || []).map((m: any) => (
                <MilestoneCard
                  key={m.id}
                  milestone={m}
                  contract={contract}
                  userRole="FREELANCER"
                  onUpdated={onContractUpdated}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
