"use client";

import React from "react";
import { ShieldCheck, Sparkles, SplitSquareVertical, Users, LayoutDashboard, CreditCard } from "lucide-react";

export type ActiveViewMode = "client" | "freelancer" | "grid" | "split";

interface NavbarProps {
  currentView: ActiveViewMode;
  onViewChange: (view: ActiveViewMode) => void;
  onOpenScopeModal: () => void;
  contractCount: number;
}

export function Navbar({
  currentView,
  onViewChange,
  onOpenScopeModal,
  contractCount,
}: NavbarProps) {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-[1px] flex items-center justify-center shadow-lg shadow-blue-500/20">
            <div className="h-full w-full bg-zinc-950 rounded-[11px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight">AgentPact</span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                PayPal AI Escrow
              </span>
            </div>
            <p className="text-xs text-zinc-400">Autonomous Milestone Verification Protocol</p>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="hidden md:flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-1 text-xs">
          <button
            onClick={() => onViewChange("client")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              currentView === "client"
                ? "bg-blue-600 text-white font-medium shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Client View
          </button>

          <button
            onClick={() => onViewChange("freelancer")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              currentView === "freelancer"
                ? "bg-indigo-600 text-white font-medium shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Freelancer View
          </button>

          <button
            onClick={() => onViewChange("grid")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              currentView === "grid"
                ? "bg-emerald-600 text-white font-medium shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            AG Grid Ledger
          </button>

          <button
            onClick={() => onViewChange("split")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              currentView === "split"
                ? "bg-purple-600 text-white font-medium shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            Dual Screen
          </button>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 px-2.5 py-1 rounded-md bg-zinc-900/80 border border-zinc-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>PayPal Sandbox</span>
          </div>

          <button
            onClick={onOpenScopeModal}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Scope with AI
          </button>
        </div>
      </div>
    </header>
  );
}
