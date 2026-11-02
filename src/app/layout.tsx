import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgentPact | Autonomous AI Milestone Escrow Protocol",
  description: "Next-generation freelance escrow protocol combining PayPal Orders & Payouts with Gemini 2.5 Flash autonomous deliverable verification and AG Grid telemetry.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100">{children}</body>
    </html>
  );
}
