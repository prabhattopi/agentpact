# 🛡️ AgentPact: Autonomous PayPal AI Escrow Protocol

<div align="center">

![AgentPact Hackathon Banner](./public/thumbnail.jpg)

**Autonomous Multi-Agent Milestone Escrow & Instant Payout Rails powered by PayPal REST APIs & Google Gemini 2.5 Flash**

[![PayPal REST APIs](https://img.shields.io/badge/PayPal-Orders%20v2%20%7C%20Payouts%20v1-003087?style=for-the-badge&logo=paypal&logoColor=white)](https://developer.paypal.com)
[![Google Gemini](https://img.shields.io/badge/Gemini-2.5%20Flash%20AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://aistudio.google.com)
[![AG Grid](https://img.shields.io/badge/AG%20Grid-v33%20Enterprise%20Ledger-E02424?style=for-the-badge&logo=grid&logoColor=white)](https://www.ag-grid.com)
[![Neon Postgres](https://img.shields.io/badge/Neon-Serverless%20Postgres-00E599?style=for-the-badge&logo=postgresql&logoColor=black)](https://neon.tech)
[![Next.js](https://img.shields.io/badge/Next.js-16%20%7C%20React%2019-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)

*Built for the **PayPal AI Hackathon 2026***

</div>

---

## 🌟 Executive Overview & The Problem

Freelance marketplaces (Upwork, Escrow.com) charge **10%–20% in intermediary cuts** and lock payments in bureaucratic limbo for 7–14 days. 
- **Clients risk paying upfront for defective or missing deliverables.**
- **Developers risk ghosting or unfair milestone rejections after delivering working code.**
- **Autonomous AI Agents have zero native payment rails** to verify and settle deliverables programmatically.

**AgentPact** bridges this trust deficit using an autonomous multi-agent protocol backed by **PayPal REST APIs (Orders v2 + Payouts v1)**, **Gemini 2.5 Flash**, and **AG Grid Enterprise**:

```mermaid
sequenceDiagram
    autonumber
    actor Client as 👤 Client / Sponsor
    participant Scoper as 🤖 Gemini Scoper Agent
    participant PayPal as 💳 PayPal Orders v2 (Escrow Hold)
    participant AG as 📊 AG Grid Command Center
    participant Verifier as 🧠 Gemini Verifier Agent
    actor Dev as 👨‍💻 Freelancer / AI Worker
    participant Payout as ⚡ PayPal Payouts v1 (Instant Release)

    Client->>Scoper: Submit Project Specs / PRD
    Scoper-->>Client: Generates Weighted Acceptance Criteria Rubric
    Client->>PayPal: Authorize & Lock Escrow Funds (Orders v2)
    PayPal-->>AG: Log Escrow State in Real-Time Grid
    Dev->>Verifier: Submit Deliverables (GitHub PR / Notes / Diff)
    Verifier->>Verifier: Run Autonomous Audit with Anti-Hallucination Checks
    alt Audit Passes (Score >= 80)
        Verifier->>Payout: Trigger Instant Programmatic Release (Payouts v1)
        Payout-->>Dev: Funds Dispatched Instantly to PayPal Account
        Payout-->>AG: Update Escrow Status to 'PAID'
    else Dispute Raised
        Client->>Verifier: Trigger AI Arbitration (Binding Settlement Split)
    end
```

---

## ⚡ Key Highlights & Core Features

### 1. 🤖 Autonomous AI Contract Scoper (Gemini 2.5 Flash)
- Ingests raw, unstructured project descriptions or PRDs.
- Outputs a mathematically verified JSON milestone breakdown where milestone amounts sum up exactly to the total contract budget.
- Formulates objective, testable acceptance rubrics (test coverage, schema validation, artifact presence).

### 2. 💳 PayPal Smart Escrow Engine (Orders API v2)
- Integrates `intent: CAPTURE` with HATEOAS approval routing.
- Supports both live **PayPal Sandbox Checkout Authorization** and **Fast-Track 1-Click Escrow Lock** for judges.
- Locks funds securely before work begins, eliminating client payment default risk.

### 3. 🧠 Autonomous Deliverable Verifier (Anti-Hallucination Guardrails)
- Rigorously checks code PRs, implementation notes, and git diffs against acceptance criteria.
- **Strict Evidence Requirement**: If a developer notes a feature without citing verifiable proof, Gemini flags it with `FAIL` and reduces the score (protecting client funds).
- Enforces an immutable financial state-machine: **Payout release is mathematically impossible unless score $\ge 80\%$**.

### 4. ⚡ Instant Programmatic Settlement (Payouts API v1)
- Once the milestone passes AI verification, triggers instant release directly to the developer's PayPal account.
- Records official PayPal Payout Batch IDs with celebratory visual feedback.
- Includes automated regional regulatory compliance fallbacks.

### 5. ⚖️ Autonomous AI Dispute Arbitrator
- Neutral AI mediator analyzes client claims vs. freelancer defenses.
- Generates binding, equitable pro-rata monetary splits (e.g., 50% refund to client via PayPal, 50% release to developer) with detailed legal-technical justifications.

### 6. 📊 AG Grid v33+ Enterprise Command Center
- Built using AG Grid's modern `themeQuartz` CSS-in-JS theming engine.
- Features executive metric cards, quick-search filter bar, sortable columns, color-coded status badges, and milestone progress bars.

---

## 💻 Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | **Next.js 16.4.2 (App Router)** | Full-stack serverless architecture with TypeScript 5.9. |
| **Enterprise Grid** | **AG Grid Community v33.3** | High-performance interactive telemetry with Quartz dark theme. |
| **AI Engine** | **Google Gemini 2.5 Flash** | `@google/generative-ai` with structured JSON schema outputs. |
| **Payment Rails** | **PayPal REST API v2** | Orders API v2 (Escrow Hold) & Payouts API v1 (Instant Release). |
| **Database** | **Neon Serverless PostgreSQL** | Cloud-native serverless Postgres with Prisma ORM 6.19. |
| **Styling** | **Tailwind CSS v4** | Dark-mode-first fintech aesthetics with Lucide React icons. |

---

## 🚀 Setup & Installation Guide

### Prerequisites
- Node.js 20+ (tested on Node v22)
- pnpm (or npm / yarn)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/prabhattopi/agentpact.git
cd agentpact
pnpm install
```

### 2. Configure Environment Variables
Create `.env` (for Prisma CLI) and `.env.local` (for Next.js runtime):

```env
# 1. Neon Serverless Postgres DB Connection
DATABASE_URL="postgresql://[user]:[password]@[endpoint].neon.tech/neondb?sslmode=require"

# 2. Google Gemini API Key (https://aistudio.google.com/app/apikey)
GEMINI_API_KEY="AIzaSy..."

# 3. PayPal Developer Sandbox Credentials (https://developer.paypal.com/dashboard/applications/sandbox)
PAYPAL_CLIENT_ID="your-paypal-sandbox-client-id"
PAYPAL_CLIENT_SECRET="your-paypal-sandbox-client-secret"
PAYPAL_MODE="sandbox"
PAYPAL_API_BASE_URL="https://api-m.sandbox.paypal.com"

# 4. App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Synchronize Database Schema
Push the Prisma models directly to your Neon database:
```bash
pnpm exec prisma db push
```

### 4. Run Development Server
```bash
pnpm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🧪 End-to-End Testing Walkthrough

Follow these simple steps to test the entire protocol:

1. **Scope a Contract with AI**:
   - Click **"Scope with AI"** in the top navigation bar.
   - Enter raw requirements (e.g., *"Build an analytics dashboard with PayPal payouts and unit tests"*).
   - Click **"Architect Milestones & Rubric with AI"** ➔ Gemini synthesizes structured milestones.
   - Click **"Lock Contract & Prepare PayPal Escrow"**.

2. **Authorize & Lock PayPal Escrow**:
   - In the contract banner, click **"Authorize & Lock Escrow via PayPal"**.
   - Select **"Instant Fast-Track Escrow Lock"** (or use **"Open Sandbox Checkout Tab"** to log in with a PayPal Sandbox buyer account).
   - Status updates to `🟢 Funded in PayPal Escrow`.

3. **Submit Deliverables (Freelancer Workspace)**:
   - Click any milestone to open the **Slide-Over Drawer**.
   - Switch to the **`</> Deliverables`** tab.
   - Enter a PR link, implementation notes, and optional code diff.
   - Click **"Save & Hash Deliverable"** (generates cryptographic SHA-256 fingerprint).

4. **Execute Autonomous AI Verification (Gemini 2.5 Flash)**:
   - In the drawer's **`🛡️ AI Audit & Rubric`** tab, click **"Run Autonomous AI Verification"**.
   - Gemini evaluates each criterion with cited evidence.
   - *Try an incomplete submission to see Gemini award a failing score (e.g., 43/100) and lock the payout button!*
   - *Provide complete evidence to score 90+/100 and unlock the release button!*

5. **Release Instant PayPal Payout**:
   - Switch to the **`$ PayPal Settlement`** tab.
   - Click **"Release via PayPal Payout"**.
   - Confetti triggers and the milestone is officially marked `Paid via PayPal` with an immutable Batch ID.

6. **Test AI Dispute Arbitration**:
   - Switch to the **Client View** and open any milestone drawer.
   - Click **"Raise Dispute"** ➔ Gemini Arbitrator analyzes both claims and calculates an equitable pro-rata split with binding legal terms.

7. **Monitor the Enterprise AG Grid Ledger**:
   - Click **"AG Grid Ledger"** in the top bar to inspect real-time multi-contract telemetry, search filters, and payout completion bars.

---

## 📜 License
MIT License - Open Source for PayPal AI Hackathon 2026.
