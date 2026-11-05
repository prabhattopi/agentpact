export type UserRole = "CLIENT" | "FREELANCER" | "ARBITRATOR";

export type ContractStatus =
  | "DRAFT"
  | "ESCROW_LOCKED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "DISPUTED"
  | "CANCELLED";

export type MilestoneStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "VERIFIED"
  | "PAID"
  | "DISPUTED";

export interface CriterionCheck {
  id: string;
  description: string;
  weight: number; // e.g. 1 to 5
  required: boolean;
  type: "TEST_COVERAGE" | "FEATURE_COMPLETION" | "SCHEMA_VALIDATION" | "CODE_QUALITY" | "ARTIFACT_PRESENCE";
}

export interface CriterionResult {
  criterionId: string;
  description: string;
  satisfied: boolean;
  confidence: number; // 0.0 to 1.0
  reasoning: string;
  evidenceFound: string;
}

export interface MilestoneAuditResult {
  milestoneId: string;
  overallScore: number; // 0 - 100
  passed: boolean;
  passingThreshold: number; // Default 80
  criteriaResults: CriterionResult[];
  securityRisk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  antiHallucinationScore: number; // 0.0 to 1.0
  summary: string;
  actionableFeedback: string[];
  timestamp: string;
}

export interface EscrowReleaseRequest {
  contractId: string;
  milestoneId: string;
  submissionHash: string;
  targetPayPalEmail: string;
  requestedAmount: number;
  currency: string;
}

export interface PayoutExecutionResult {
  success: boolean;
  batchId?: string;
  payoutStatus?: string;
  error?: string;
  rawResponse?: unknown;
}

