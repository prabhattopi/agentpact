"use client";

import React, { useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef, ModuleRegistry, AllCommunityModule, themeQuartz } from "ag-grid-community";
import { ShieldCheck, Search, DollarSign, Activity, CheckCircle, AlertTriangle } from "lucide-react";

// Register AG Grid Community modules for AG Grid v33+
ModuleRegistry.registerModules([AllCommunityModule]);

// Create modern Quartz Dark Theme with custom fintech accents
const customDarkTheme = themeQuartz.withParams({
  backgroundColor: "#09090b",
  foregroundColor: "#e4e4e7",
  headerBackgroundColor: "#121215",
  borderColor: "#27272a",
  rowHoverColor: "#18181b",
  accentColor: "#3b82f6",
  fontSize: 12,
  borderRadius: 8,
});

interface AGGridEscrowLedgerProps {
  contracts: any[];
  onSelectContract: (contract: any) => void;
}

export function AGGridEscrowLedger({
  contracts,
  onSelectContract,
}: AGGridEscrowLedgerProps) {
  const [quickFilterText, setQuickFilterText] = useState("");

  // Metrics computation
  const metrics = useMemo(() => {
    let totalEscrow = 0;
    let releasedPayouts = 0;
    let activeCount = 0;
    let completedCount = 0;

    contracts.forEach((c) => {
      if (c.status === "ESCROW_LOCKED" || c.status === "IN_PROGRESS") {
        totalEscrow += c.totalBudget || 0;
        activeCount++;
      }
      if (c.status === "COMPLETED") {
        completedCount++;
      }
      (c.milestones || []).forEach((m: any) => {
        if (m.status === "PAID") {
          releasedPayouts += m.amount || 0;
        }
      });
    });

    return { totalEscrow, releasedPayouts, activeCount, completedCount };
  }, [contracts]);

  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: "Contract Details",
        field: "title",
        flex: 2,
        minWidth: 200,
        cellRenderer: (params: any) => {
          const c = params.data;
          return (
            <div className="flex flex-col justify-center h-full py-1">
              <span className="font-semibold text-white truncate text-xs">{c.title}</span>
              <span className="text-[10px] text-zinc-400">{c.category || "Software Development"}</span>
            </div>
          );
        },
      },
      {
        headerName: "Client",
        field: "client.name",
        flex: 1.2,
        minWidth: 140,
        cellRenderer: (params: any) => (
          <div className="flex flex-col justify-center h-full">
            <span className="text-xs text-zinc-200">{params.value || "Enterprise Client"}</span>
            <span className="text-[10px] text-zinc-500">{params.data?.client?.email}</span>
          </div>
        ),
      },
      {
        headerName: "Freelancer (PayPal Recipient)",
        field: "freelancer.name",
        flex: 1.5,
        minWidth: 160,
        cellRenderer: (params: any) => (
          <div className="flex flex-col justify-center h-full">
            <span className="text-xs text-zinc-200">{params.value || "Dev Agent"}</span>
            <span className="text-[10px] text-blue-400 truncate">{params.data?.freelancer?.paypalEmail || params.data?.freelancer?.email}</span>
          </div>
        ),
      },
      {
        headerName: "Escrow Status",
        field: "status",
        flex: 1.2,
        minWidth: 130,
        cellRenderer: (params: any) => {
          const status = params.value;
          let badgeClass = "bg-zinc-800 text-zinc-300 border-zinc-700";
          if (status === "ESCROW_LOCKED") badgeClass = "bg-blue-500/10 text-blue-400 border-blue-500/30";
          if (status === "IN_PROGRESS") badgeClass = "bg-amber-500/10 text-amber-400 border-amber-500/30";
          if (status === "COMPLETED") badgeClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
          if (status === "DISPUTED") badgeClass = "bg-rose-500/10 text-rose-400 border-rose-500/30";

          return (
            <div className="flex items-center h-full">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeClass}`}>
                {status || "DRAFT"}
              </span>
            </div>
          );
        },
      },
      {
        headerName: "Escrow Budget",
        field: "totalBudget",
        flex: 1,
        minWidth: 110,
        cellRenderer: (params: any) => (
          <div className="flex items-center h-full font-semibold text-emerald-400 text-xs">
            ${params.value?.toLocaleString()} {params.data?.currency || "USD"}
          </div>
        ),
      },
      {
        headerName: "PayPal Order Ref",
        field: "paypalOrderId",
        flex: 1.3,
        minWidth: 150,
        cellRenderer: (params: any) => (
          <div className="flex items-center h-full font-mono text-[10px] text-zinc-400">
            {params.value ? (
              <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-cyan-300">
                {params.value}
              </span>
            ) : (
              <span className="text-zinc-600">Pending Authorization</span>
            )}
          </div>
        ),
      },
      {
        headerName: "Milestone Progress",
        field: "milestones",
        flex: 1.5,
        minWidth: 140,
        cellDataType: false,
        cellRenderer: (params: any) => {
          const milestones = params.value || [];
          const paidCount = milestones.filter((m: any) => m.status === "PAID").length;
          const percent = milestones.length > 0 ? Math.round((paidCount / milestones.length) * 100) : 0;

          return (
            <div className="flex flex-col justify-center h-full gap-1 w-full pr-2">
              <div className="flex justify-between text-[10px] text-zinc-400">
                <span>{paidCount} / {milestones.length} Paid</span>
                <span>{percent}%</span>
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        },
      },
      {
        headerName: "Action",
        field: "id",
        flex: 0.9,
        minWidth: 90,
        cellRenderer: (params: any) => (
          <div className="flex items-center h-full">
            <button
              onClick={() => onSelectContract(params.data)}
              className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white transition-all cursor-pointer"
            >
              Inspect
            </button>
          </div>
        ),
      },
    ],
    [onSelectContract]
  );

  return (
    <div className="space-y-4">
      {/* Executive Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Escrow Locked Total</span>
            <DollarSign className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-white tracking-tight">
            ${metrics.totalEscrow.toLocaleString()}
          </div>
          <p className="text-[10px] text-zinc-500 mt-0.5">Protected in PayPal Sandbox</p>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>AI Verified Payouts</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 tracking-tight">
            ${metrics.releasedPayouts.toLocaleString()}
          </div>
          <p className="text-[10px] text-zinc-500 mt-0.5">Programmatic Instant Releases</p>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Active Contracts</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-white tracking-tight">{metrics.activeCount}</div>
          <p className="text-[10px] text-zinc-500 mt-0.5">In Multi-Agent Workflow</p>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Dispute Rate</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-purple-400 tracking-tight">0.0%</div>
          <p className="text-[10px] text-zinc-500 mt-0.5">Autonomous Mediation Guard</p>
        </div>
      </div>

      {/* Grid Filter Bar */}
      <div className="flex items-center justify-between gap-4 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-200">AG Grid Enterprise Ledger</span>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
            {contracts.length} records
          </span>
        </div>

        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search contracts, users, IDs..."
            value={quickFilterText}
            onChange={(e) => setQuickFilterText(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* AG Grid Component with themeQuartz */}
      <div className="w-full h-[420px] rounded-xl overflow-hidden border border-zinc-800 shadow-xl">
        <AgGridReact
          theme={customDarkTheme}
          rowData={contracts}
          columnDefs={columnDefs}
          quickFilterText={quickFilterText}
          pagination={true}
          paginationPageSize={10}
          paginationPageSizeSelector={[10, 20, 50]}
          defaultColDef={{
            sortable: true,
            filter: true,
            resizable: true,
          }}
          rowHeight={52}
          headerHeight={42}
        />
      </div>
    </div>
  );
}
