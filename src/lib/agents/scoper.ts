import { GoogleGenerativeAI } from "@google/generative-ai";
import { sanitizeInput } from "./security";
import { CriterionCheck } from "@/types";

export interface ScopedMilestone {
  title: string;
  description: string;
  amount: number;
  orderIndex: number;
  acceptanceCriteria: CriterionCheck[];
}

export interface ScopedContractPlan {
  title: string;
  description: string;
  category: string;
  totalBudget: number;
  currency: string;
  milestones: ScopedMilestone[];
}

export async function scopeProjectRequirements(
  rawRequirements: string,
  targetBudget?: number
): Promise<ScopedContractPlan> {
  const sanitized = sanitizeInput(rawRequirements);
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "your-gemini-api-key") {
    console.warn("[ScoperAgent] GEMINI_API_KEY not configured. Generating realistic mock scoped contract.");
    return generateMockContractPlan(sanitized, targetBudget || 1200);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // Using gemini-2.5-flash or gemini-1.5-flash with JSON mode
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.2, // Low temperature for deterministic contract scoping
    },
  });

  const prompt = `
You are the Lead Contract Scoping AI Agent for AgentPact, an autonomous milestone escrow protocol powered by PayPal.
Your objective: Take raw, unstructured project requirements from a client and break them down into objective, verifiable milestones with strict acceptance criteria that can later be verified autonomously by an AI verifier.

Client Requirements:
"""
${sanitized}
"""

Target Budget (USD): ${targetBudget || "Suggest a reasonable fair market budget between $500 and $3000"}

You must return a valid JSON object matching this schema:
{
  "title": "Short concise project name (max 60 chars)",
  "description": "Comprehensive summary of deliverables and scope",
  "category": "e.g. Web Development, AI Integration, Mobile App, Backend API",
  "totalBudget": number,
  "currency": "USD",
  "milestones": [
    {
      "title": "Milestone title",
      "description": "Specific deliverables required",
      "amount": number (sum of all milestone amounts MUST equal totalBudget),
      "orderIndex": 1,
      "acceptanceCriteria": [
        {
          "id": "crit-1",
          "description": "Exact objective condition (e.g., 'Jest/Vitest test suite passes with >80% coverage', 'PayPal checkout webhook handler returns 200 OK')",
          "weight": number (1 to 5),
          "required": boolean,
          "type": "TEST_COVERAGE" | "FEATURE_COMPLETION" | "SCHEMA_VALIDATION" | "CODE_QUALITY" | "ARTIFACT_PRESENCE"
        }
      ]
    }
  ]
}

Guidelines:
1. Divide the project into 2 to 4 progressive milestones.
2. Ensure milestone amounts sum up EXACTLY to totalBudget.
3. Criteria must be OBJECTIVELY verifiable from code diffs, logs, or schema contracts (avoid vague criteria like 'looks nice').
`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsed = JSON.parse(responseText) as ScopedContractPlan;
    
    // Safety check: ensure milestone amounts match totalBudget
    const sumMilestones = parsed.milestones.reduce((acc, m) => acc + m.amount, 0);
    if (Math.abs(sumMilestones - parsed.totalBudget) > 0.01) {
      parsed.totalBudget = sumMilestones;
    }

    return parsed;
  } catch (error) {
    console.error("[ScoperAgent] Error scoping requirements with Gemini:", error);
    return generateMockContractPlan(sanitized, targetBudget || 1200);
  }
}

function generateMockContractPlan(requirements: string, budget: number): ScopedContractPlan {
  const m1 = Math.round(budget * 0.35);
  const m2 = Math.round(budget * 0.40);
  const m3 = budget - m1 - m2;

  return {
    title: requirements.slice(0, 45) || "Fullstack AI-Powered Web Application",
    description: `Engineered implementation based on client specs: ${requirements.slice(0, 150)}...`,
    category: "Full-Stack Software Development",
    totalBudget: budget,
    currency: "USD",
    milestones: [
      {
        title: "Architecture, DB Schema & API Specification",
        description: "Set up project repository, Neon DB connection, Prisma schema, and initial API endpoints.",
        amount: m1,
        orderIndex: 1,
        acceptanceCriteria: [
          {
            id: "crit-1",
            description: "Prisma schema includes User, Contract, Milestone models with foreign keys intact",
            weight: 3,
            required: true,
            type: "SCHEMA_VALIDATION",
          },
          {
            id: "crit-2",
            description: "API route /api/health returns 200 with database status connected",
            weight: 2,
            required: true,
            type: "TEST_COVERAGE",
          },
        ],
      },
      {
        title: "Core Business Logic & PayPal Integration",
        description: "Implement core business service, PayPal Orders authorization, and state machine hooks.",
        amount: m2,
        orderIndex: 2,
        acceptanceCriteria: [
          {
            id: "crit-3",
            description: "PayPal sandbox createOrder and captureOrder client endpoints operational",
            weight: 4,
            required: true,
            type: "FEATURE_COMPLETION",
          },
          {
            id: "crit-4",
            description: "Unit tests pass with >80% code coverage across payment helper methods",
            weight: 3,
            required: false,
            type: "TEST_COVERAGE",
          },
        ],
      },
      {
        title: "UI Polish, AG Grid Integration & Production Deployment",
        description: "Deliver responsive AG Grid data management view, error boundaries, and deployment verification.",
        amount: m3,
        orderIndex: 3,
        acceptanceCriteria: [
          {
            id: "crit-5",
            description: "AG Grid renders transaction history with sorting, filtering, and status badges",
            weight: 3,
            required: true,
            type: "ARTIFACT_PRESENCE",
          },
          {
            id: "crit-6",
            description: "TypeScript compilation passes with zero errors (`next build`)",
            weight: 4,
            required: true,
            type: "CODE_QUALITY",
          },
        ],
      },
    ],
  };
}

