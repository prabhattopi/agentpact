"use client";

import React, { useState } from "react";
import { PayPalEscrowModal } from "./PayPalEscrowModal";
import { MilestoneDrawer } from "./MilestoneDrawer";
import {
  ShieldCheck,
  Lock,
  Sparkles,
  Loader2,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  DollarSign,
  AlertCircle,
  FileCode2,
} from "lucide-react";
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
  const [orderModalData, setOrderModalData] = useState<{ id: string; approveUrl?: string } | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null);
  const [drawerRole, setDrawerRole] = useState<"CLIENT" | "FREELANCER">("FREELANCER");

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

  // Initiate PayPal Escrow Order Creation
  const handleOpenEscrowFlow = async () => {
    setFundingEscrow(true);
    try {
      const orderRes = await fetch("/api/escrow/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractId: contract.id }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error);

      // Open PayPal Authorization Modal
      setOrderModalData({
        id: orderData.id,
        approveUrl: orderData.approveUrl,
      });
    } catch (err: any) {
      alert("Failed to create PayPal escrow order: " + err.message);
    } finally {
      setFundingEscrow(false);
    }
  };

  const handleOpenMilestone = (m: any, role: "CLIENT" | "FREELANCER") => {
    setSelectedMilestone(m);
    setDrawerRole(role);
  };

  const showClient = viewMode === "client" || viewMode === "split";
  const showFreelancer = viewMode === "freelancer" || viewMode === "split";

  return (
    <div className="space-y-4">
      {/* Compact Contract Executive Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {contract.category || "Fullstack Software"}
            </span>
            <span className="text-[11px] text-zinc-400 font-mono">ID: {contract.id}</span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">{contract.title}</h2>
          <p className="text-xs text-zinc-400 max-w-2xl truncate">{contract.description}</p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Total Escrow</span>
            <span className="text-xl font-extrabold text-emerald-400 tracking-tight">
              ${contract.totalBudget?.toLocaleString()} {contract.currency || "USD"}
            </span>
          </div>

          {/* Escrow Lock State */}
          {isDraft ? (
            <button
              onClick={handleOpenEscrowFlow}
              disabled={fundingEscrow}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/25 cursor-pointer disabled:opacity-50"
            >
              {fundingEscrow ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Generating Order...
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  Authorize & Lock Escrow
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Funded in PayPal Escrow</span>
            </div>
          )}
        </div>
      </div>

      {/* Synchronized Columns with Compact Drawer Triggers */}
      <div
        className={`grid gap-4 ${
          viewMode === "split" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
        }`}
      >
        {/* Left Column: Client Role View */}
        {showClient && (
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-zinc-900/60 px-3.5 py-2.5 rounded-xl border border-zinc-800 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                <span className="font-bold text-white tracking-wide">
                  CLIENT VIEW — {contract.client?.name || "Enterprise Sponsor"}
                </span>
              </div>
              <span className="text-zinc-500 font-mono text-[11px]">{contract.client?.email}</span>
            </div>

            <div className="space-y-2.5">
              {(contract.milestones || []).map((m: any) => {
                const isPaid = m.status === "PAID";
                const isSubmitted = m.status === "SUBMITTED";
                const isDisputed = m.status === "DISPUTED";

                return (
                  <div
                    key={m.id}
                    onClick={() => handleOpenMilestone(m, "CLIENT")}
                    className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800 hover:border-blue-500/40 hover:bg-zinc-850 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                          M#{m.orderIndex}
                        </span>
                        <span className="text-xs font-semibold text-white truncate">{m.title}</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 truncate">{m.description}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {isDisputed ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          ⚖️ Arbitrated
                        </span>
                      ) : isPaid ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Paid
                        </span>
                      ) : isSubmitted ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Reviewing
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                          Pending
                        </span>
                      )}

                      <span className="text-xs font-bold text-zinc-200">${m.amount} USD</span>
                      <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-blue-400 transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Right Column: Freelancer Role View */}
        {showFreelancer && (
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-zinc-900/60 px-3.5 py-2.5 rounded-xl border border-zinc-800 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
                <span className="font-bold text-white tracking-wide">
                  FREELANCER VIEW — {contract.freelancer?.name || "AI Dev Agent"}
                </span>
              </div>
              <span className="text-blue-400 font-mono text-[11px]">
                {contract.freelancer?.paypalEmail || contract.freelancer?.email}
              </span>
            </div>

            <div className="space-y-2.5">
              {(contract.milestones || []).map((m: any) => {
                const isPaid = m.status === "PAID";
                const isSubmitted = m.status === "SUBMITTED";
                const isDisputed = m.status === "DISPUTED";

                return (
                  <div
                    key={m.id}
                    onClick={() => handleOpenMilestone(m, "FREELANCER")}
                    className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800 hover:border-indigo-500/40 hover:bg-zinc-850 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400">
                          M#{m.orderIndex}
                        </span>
                        <span className="text-xs font-semibold text-white truncate">{m.title}</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 truncate">{m.description}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {isDisputed ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          ⚖️ Settled (Split)
                        </span>
                      ) : isPaid ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Settled
                        </span>
                      ) : isSubmitted ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          Audit Ready
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                          Submit Work
                        </span>
                      )}

                      <span className="text-xs font-bold text-emerald-400">${m.amount} USD</span>
                      <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Slide-over Inspection Drawer */}
      <MilestoneDrawer
        isOpen={Boolean(selectedMilestone)}
        onClose={() => setSelectedMilestone(null)}
        milestone={selectedMilestone}
        contract={contract}
        activeRole={drawerRole}
        onUpdated={onContractUpdated}
        onRaiseDispute={onRaiseDispute}
      />

      {/* PayPal Escrow Authorization Modal */}
      <PayPalEscrowModal
        isOpen={Boolean(orderModalData)}
        onClose={() => setOrderModalData(null)}
        contract={contract}
        orderData={orderModalData}
        onEscrowLocked={onContractUpdated}
      />
    </div>
  );
}
