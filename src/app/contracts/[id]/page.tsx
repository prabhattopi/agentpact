"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { ShieldCheck, CheckCircle2, Lock, ArrowRight, Loader2, AlertCircle, Home } from "lucide-react";
import confetti from "canvas-confetti";
import Link from "next/link";

function EscrowReturnContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const contractId = params?.id as string;
  const escrowState = searchParams.get("escrow");
  const token = searchParams.get("token"); // PayPal Order ID
  const payerId = searchParams.get("PayerID");

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captureId, setCaptureId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    if (!contractId) return;

    if (escrowState === "cancel") {
      setLoading(false);
      setError("PayPal escrow authorization was cancelled by the user.");
      return;
    }

    if (escrowState === "success" && token) {
      // Execute the capture via PayPal API
      const captureOrder = async () => {
        try {
          const res = await fetch("/api/escrow/capture", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contractId,
              orderId: token,
            }),
          });

          const data = await res.json();
          if (!res.ok) {
            // If already captured, handle gracefully
            if (data.error?.includes("ORDER_ALREADY_CAPTURED")) {
              setSuccess(true);
              setCaptureId(token);
              return;
            }
            throw new Error(data.error || "Failed to capture PayPal escrow");
          }

          setCaptureId(data.captureId || token);
          setSuccess(true);
          try {
            confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
          } catch {}
        } catch (err: any) {
          setError(err.message || "PayPal capture failed");
        } finally {
          setLoading(false);
        }
      };

      captureOrder();
    } else {
      // Direct view or missing params
      setLoading(false);
    }
  }, [contractId, escrowState, token]);

  // Countdown timer to auto-redirect to main dashboard
  useEffect(() => {
    if (!success) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          router.push(`/?contractId=${contractId}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [success, contractId, router]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
        {/* Brand Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white">AgentPact Escrow</h1>
              <p className="text-[10px] text-zinc-400">Autonomous Settlement Protocol</p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
            PayPal Orders v2
          </span>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            <div>
              <p className="text-sm font-medium text-white">Verifying PayPal Authorization...</p>
              <p className="text-xs text-zinc-400 mt-1">Capturing escrow hold for Order #{token}</p>
            </div>
          </div>
        )}

        {/* Success State */}
        {!loading && success && (
          <div className="space-y-5 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">Escrow Funded & Locked!</h2>
              <p className="text-xs text-zinc-400 mt-1">
                PayPal has confirmed your authorization. Funds are now secured in the autonomous escrow pool.
              </p>
            </div>

            {/* Receipt Summary */}
            <div className="bg-zinc-950/80 rounded-xl border border-zinc-800/80 p-3 text-left space-y-2 text-xs font-mono">
              <div className="flex justify-between text-zinc-400">
                <span>Contract ID:</span>
                <span className="text-zinc-200 truncate max-w-[180px]">{contractId}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>PayPal Order Ref:</span>
                <span className="text-blue-400 truncate max-w-[180px]">{token}</span>
              </div>
              {payerId && (
                <div className="flex justify-between text-zinc-400">
                  <span>Payer ID:</span>
                  <span className="text-zinc-300">{payerId}</span>
                </div>
              )}
              {captureId && (
                <div className="flex justify-between text-zinc-400">
                  <span>Capture ID:</span>
                  <span className="text-emerald-400 truncate max-w-[180px]">{captureId}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-400 pt-1 border-t border-zinc-800">
                <span>Escrow Status:</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  FUNDED_IN_ESCROW
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href={`/?contractId=${contractId}`}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-600/20"
              >
                <span>Return to Command Center ({countdown}s)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-base font-semibold text-white">Escrow Hold Notice</h2>
              <p className="text-xs text-red-400 mt-1">{error}</p>
            </div>

            <Link
              href="/"
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Return to Dashboard</span>
            </Link>
          </div>
        )}

        {/* Fallback View (Direct Visit) */}
        {!loading && !success && !error && (
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Contract #{contractId}</h2>
              <p className="text-xs text-zinc-400 mt-1">Direct view. You can return to the main dashboard.</p>
            </div>
            <Link
              href={`/?contractId=${contractId}`}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <span>Open in Command Center</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ContractPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      }
    >
      <EscrowReturnContent />
    </Suspense>
  );
}
