"use client";

import React, { useEffect, useState } from "react";
import { Navbar, ActiveViewMode } from "@/components/Navbar";
import { AGGridEscrowLedger } from "@/components/AGGridEscrowLedger";
import { DualViewContainer } from "@/components/DualViewContainer";
import { ContractScoperModal } from "@/components/ContractScoperModal";
import { DisputeModal } from "@/components/DisputeModal";
import { Loader2, Plus, Sparkles } from "lucide-react";

export default function Home() {
  const [viewMode, setViewMode] = useState<ActiveViewMode>("split");
  const [contracts, setContracts] = useState<any[]>([]);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isScopeModalOpen, setIsScopeModalOpen] = useState(false);
  const [disputeMilestone, setDisputeMilestone] = useState<any>(null);

  // Fetch contracts
  const fetchContracts = async () => {
    try {
      const res = await fetch("/api/contracts");
      const data = await res.json();
      
      if (Array.isArray(data) && data.length > 0) {
        setContracts(data);
        if (!selectedContract) {
          setSelectedContract(data[0]);
        } else {
          const refreshed = data.find((c: any) => c.id === selectedContract.id);
          if (refreshed) setSelectedContract(refreshed);
        }
      } else {
        // Seed default demo contract if empty
        seedDemoContract();
      }
    } catch (err) {
      console.error("Failed to load contracts:", err);
    } finally {
      setLoading(false);
    }
  };

  const seedDemoContract = async () => {
    try {
      const res = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Autonomous DeFi Escrow & AG Grid Analytics Suite",
          description: "Full-stack integration of PayPal sandbox escrow orders with Gemini 2.5 Flash autonomous verifier agent and AG Grid telemetry.",
          category: "Fintech & Autonomous Agents",
          totalBudget: 2400,
          currency: "USD",
          clientEmail: "acme-corp@sandbox.paypal.com",
          clientName: "Acme Fintech Corp",
          freelancerEmail: "solodev@sandbox.paypal.com",
          freelancerName: "Devin Vance (Senior Agent Architect)",
          milestones: [
            {
              title: "Architecture, PayPal Client & Security Guardrails",
              description: "Build PayPal v2 Orders authorization, token caching, and prompt-injection defense pipeline.",
              amount: 800,
              orderIndex: 1,
              acceptanceCriteria: [
                {
                  id: "c-1",
                  description: "PayPal OAuth2 token caching handles token expiry refresh automatically",
                  weight: 3,
                  required: true,
                  type: "FEATURE_COMPLETION",
                },
                {
                  id: "c-2",
                  description: "State-machine guardrail blocks any payout exceeding remaining escrow balance",
                  weight: 4,
                  required: true,
                  type: "SCHEMA_VALIDATION",
                },
              ],
            },
            {
              title: "Autonomous Milestone Verifier & Gemini Rubric Engine",
              description: "Gemini 2.5 Flash audit agent with hallucination defense and weighted rubric scoring.",
              amount: 1000,
              orderIndex: 2,
              acceptanceCriteria: [
                {
                  id: "c-3",
                  description: "Audit agent verifies code diff against criteria and outputs structured JSON score",
                  weight: 4,
                  required: true,
                  type: "TEST_COVERAGE",
                },
                {
                  id: "c-4",
                  description: "Anti-hallucination guardrail validates that evidence is cited before marking passed",
                  weight: 3,
                  required: true,
                  type: "CODE_QUALITY",
                },
              ],
            },
            {
              title: "Enterprise AG Grid Ledger & Production Deployment",
              description: "Deploy interactive AG Grid transaction view and instant PayPal Payout trigger.",
              amount: 600,
              orderIndex: 3,
              acceptanceCriteria: [
                {
                  id: "c-5",
                  description: "AG Grid renders contract telemetry, milestone status pills, and search filtering",
                  weight: 3,
                  required: true,
                  type: "ARTIFACT_PRESENCE",
                },
                {
                  id: "c-6",
                  description: "PayPal Payouts API executes instant release upon passing score >= 80",
                  weight: 4,
                  required: true,
                  type: "FEATURE_COMPLETION",
                },
              ],
            },
          ],
        }),
      });
      const seeded = await res.json();
      setContracts([seeded]);
      setSelectedContract(seeded);
    } catch (e) {
      console.error("Seed error:", e);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-blue-500/30 selection:text-blue-200">
      <Navbar
        currentView={viewMode}
        onViewChange={setViewMode}
        onOpenScopeModal={() => setIsScopeModalOpen(true)}
        contractCount={contracts.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-xs text-zinc-400">Loading AgentPact Escrow Protocol...</p>
          </div>
        ) : (
          <>
            {/* View Selector Navigation Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-white">
                    {viewMode === "grid"
                      ? "Enterprise Escrow Ledger (AG Grid)"
                      : viewMode === "split"
                      ? "Dual Perspective (Client & Freelancer Synchronized)"
                      : viewMode === "client"
                      ? "Client Management Workspace"
                      : "Freelancer Execution Workspace"}
                  </h1>
                </div>
                <p className="text-xs text-zinc-400">
                  {viewMode === "split"
                    ? "Side-by-side synchronized state simulation. Test both roles in real-time."
                    : viewMode === "grid"
                    ? "Interactive financial telemetry powered by AG Grid v33+."
                    : "Individual focused role perspective."}
                </p>
              </div>

              {/* Contract Switcher Dropdown */}
              {contracts.length > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">Active Contract:</span>
                  <select
                    value={selectedContract?.id || ""}
                    onChange={(e) => {
                      const found = contracts.find((c) => c.id === e.target.value);
                      if (found) setSelectedContract(found);
                    }}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {contracts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} (${c.totalBudget})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* View Mode Switching */}
            {viewMode === "grid" ? (
              <AGGridEscrowLedger
                contracts={contracts}
                onSelectContract={(contract) => {
                  setSelectedContract(contract);
                  setViewMode("split");
                }}
              />
            ) : (
              <DualViewContainer
                contract={selectedContract}
                viewMode={viewMode}
                onContractUpdated={fetchContracts}
                onRaiseDispute={(m) => setDisputeMilestone(m)}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">AgentPact</span>
            <span>—</span>
            <span>Built for the PayPal AI Hackathon 2026</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-zinc-400">
            <span>PayPal Orders v2</span>
            <span>•</span>
            <span>PayPal Payouts v1</span>
            <span>•</span>
            <span>Gemini 2.5 Flash</span>
            <span>•</span>
            <span>AG Grid Enterprise</span>
            <span>•</span>
            <span>Neon Serverless</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ContractScoperModal
        isOpen={isScopeModalOpen}
        onClose={() => setIsScopeModalOpen(false)}
        onContractCreated={(c) => {
          setContracts((prev) => [c, ...prev]);
          setSelectedContract(c);
        }}
      />

      <DisputeModal
        isOpen={Boolean(disputeMilestone)}
        onClose={() => setDisputeMilestone(null)}
        milestone={disputeMilestone}
        contract={selectedContract}
        onResolved={fetchContracts}
      />
    </div>
  );
}
