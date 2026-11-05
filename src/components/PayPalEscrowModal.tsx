"use client";

import React, { useState } from "react";
import { Lock, X, ExternalLink, Zap, CheckCircle2, ShieldCheck, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";

interface PayPalEscrowModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: any;
  orderData: { id: string; approveUrl?: string } | null;
  onEscrowLocked: () => void;
}

export function PayPalEscrowModal({
  isOpen,
  onClose,
  contract,
  orderData,
  onEscrowLocked,
}: PayPalEscrowModalProps) {
  const [capturing, setCapturing] = useState(false);
  const [fastTracking, setFastTracking] = useState(false);
  const [approvedInTab, setApprovedInTab] = useState(false);

  if (!isOpen || !contract || !orderData) return null;

  // Path A: Fast-Track Demo Lock
  const handleFastTrack = async () => {
    setFastTracking(true);
    try {
      const res = await fetch("/api/escrow/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractId: contract.id,
          orderId: orderData.id,
          simulateApproval: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      confetti({ particleCount: 70, spread: 60 });
      onEscrowLocked();
      onClose();
    } catch (err: any) {
      alert("Fast-track error: " + err.message);
    } finally {
      setFastTracking(false);
    }
  };

  // Path B: Real PayPal Capture (after user approved in PayPal tab)
  const handleRealCapture = async () => {
    setCapturing(true);
    try {
      const res = await fetch("/api/escrow/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractId: contract.id,
          orderId: orderData.id,
        }),
      });
      const data = await res.json();

      if (res.status === 422) {
        alert(
          "PayPal notice: The order is not yet approved in the PayPal sandbox window. Please complete the sandbox checkout or click 'Fast-Track Instant Lock'."
        );
        return;
      }

      if (!res.ok) throw new Error(data.error || "Capture failed");

      confetti({ particleCount: 80, spread: 70 });
      onEscrowLocked();
      onClose();
    } catch (err: any) {
      alert("Capture error: " + err.message);
    } finally {
      setCapturing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/70">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">PayPal Escrow Authorization</h3>
              <p className="text-xs text-zinc-400">Order #{orderData.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-zinc-400 block">Escrow Contract Amount</span>
              <span className="text-lg font-bold text-white tracking-tight">{contract.title}</span>
            </div>
            <div className="text-right">
              <span className="text-xl font-extrabold text-emerald-400">
                ${contract.totalBudget?.toLocaleString()} USD
              </span>
              <span className="text-[10px] text-zinc-500 block">Funds Held in Escrow</span>
            </div>
          </div>

          <div className="space-y-3">
            {/* Option 1: Fast Track */}
            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400 uppercase tracking-wider">
                <Zap className="w-4 h-4" />
                <span>Option 1: Fast-Track Demo Escrow (Recommended for Judges)</span>
              </div>
              <p className="text-xs text-zinc-300">
                Instantly authorizes and locks the escrow without requiring a PayPal Sandbox buyer account login. Perfect for evaluating downstream Multi-Agent verification & Payouts.
              </p>
              <button
                onClick={handleFastTrack}
                disabled={fastTracking}
                className="w-full mt-2 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/20 disabled:opacity-50"
              >
                {fastTracking ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Locking Escrow Funds...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Instant Fast-Track Escrow Lock
                  </>
                )}
              </button>
            </div>

            {/* Option 2: Live PayPal Sandbox Checkout */}
            {orderData.approveUrl && (
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Option 2: Live PayPal Sandbox Portal</span>
                </div>
                <p className="text-xs text-zinc-400">
                  Open PayPal Sandbox checkout to authenticate with a test buyer account, then click confirm capture.
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={orderData.approveUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setApprovedInTab(true)}
                    className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-cyan-300 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 border border-zinc-700"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Open Sandbox Checkout Tab
                  </a>

                  <button
                    onClick={handleRealCapture}
                    disabled={capturing}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    {capturing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Confirm & Capture"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

