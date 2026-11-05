import crypto from "crypto";
import { CriterionCheck, CriterionResult, MilestoneAuditResult } from "@/types";

/**
 * Security & Risk Mitigation Guardrails for AgentPact
 * Prevents prompt injection, hallucinatory payout releases, and unauthorized financial state changes.
 */

// 1. Prompt Injection Sanitization
export function sanitizeInput(input: string): string {
  if (!input) return "";
  
  // Strip malicious prompt-injection vectors & system overrides
  return input
    .replace(/(?:system\s*prompt|system\s*instruction|ignore\s+all\s+previous\s+instructions)/gi, "[REDACTED_PROMPT_INJECTION]")
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .trim();
}

// 2. Cryptographic Tamper-Proof Hash for Deliverables
export function computeDeliverableHash(payload: {
  milestoneId: string;
  deliverableUrl?: string | null;
  deliverableNotes?: string | null;
}): string {
  const content = `${payload.milestoneId}:${payload.deliverableUrl || ""}:${payload.deliverableNotes || ""}`;
  return crypto.createHash("sha256").update(content).digest("hex");
}

// 3. Mathematical & Anti-Hallucination Audit Guardrail
export function validateAuditIntegrity(
  criteria: CriterionCheck[],
  auditResult: {
    criteriaResults: CriterionResult[];
    overallScore: number;
    antiHallucinationScore: number;
    securityRisk: string;
  }
): { valid: boolean; reason?: string } {
  // Guardrail A: Total criteria count must match
  if (auditResult.criteriaResults.length !== criteria.length) {
    return {
      valid: false,
      reason: `Audit criteria count mismatch: expected ${criteria.length}, got ${auditResult.criteriaResults.length}`,
    };
  }

  // Guardrail B: Check evidence presence (Anti-hallucination defense)
  for (const cr of auditResult.criteriaResults) {
    if (cr.satisfied && (!cr.evidenceFound || cr.evidenceFound.trim().length < 5)) {
      return {
        valid: false,
        reason: `Criterion "${cr.description}" was marked satisfied without citing verifiable evidence`,
      };
    }
  }

  // Guardrail C: High-risk security flags must block approval
  if (auditResult.securityRisk === "CRITICAL") {
    return {
      valid: false,
      reason: "Critical security vulnerability or exploit pattern detected in submission",
    };
  }

  return { valid: true };
}

// 4. Financial State Machine Guardrail
// Prevents an agent or user from triggering an arbitrary PayPal payout without meeting all criteria
export interface StateMachineCheckParams {
  contractStatus: string;
  milestoneStatus: string;
  auditPassed: boolean;
  auditScore: number;
  milestoneAmount: number;
  remainingContractBalance: number;
}

export function verifyStateTransitionAllowed(params: StateMachineCheckParams): {
  allowed: boolean;
  errorCode?: string;
  errorMessage?: string;
} {
  // Step 1: Contract state must be ESCROW_LOCKED or IN_PROGRESS
  if (params.contractStatus !== "ESCROW_LOCKED" && params.contractStatus !== "IN_PROGRESS") {
    return {
      allowed: false,
      errorCode: "INVALID_CONTRACT_STATE",
      errorMessage: `Contract must be funded in escrow. Current status: ${params.contractStatus}`,
    };
  }

  // Step 2: Milestone must have been officially submitted
  if (params.milestoneStatus !== "SUBMITTED" && params.milestoneStatus !== "VERIFIED") {
    return {
      allowed: false,
      errorCode: "INVALID_MILESTONE_STATE",
      errorMessage: `Milestone is not in a submittable/verifiable state. Current status: ${params.milestoneStatus}`,
    };
  }

  // Step 3: AI Audit must have passed with required score
  if (!params.auditPassed || params.auditScore < 80) {
    return {
      allowed: false,
      errorCode: "AUDIT_THRESHOLD_NOT_MET",
      errorMessage: `Autonomous audit score (${params.auditScore}) does not meet the passing threshold (80)`,
    };
  }

  // Step 4: Amount sanity check
  if (params.milestoneAmount <= 0) {
    return {
      allowed: false,
      errorCode: "INVALID_PAYOUT_AMOUNT",
      errorMessage: "Payout amount must be greater than zero",
    };
  }

  if (params.milestoneAmount > params.remainingContractBalance + 0.01) {
    return {
      allowed: false,
      errorCode: "EXCEEDS_ESCROW_BALANCE",
      errorMessage: `Requested milestone payout ($${params.milestoneAmount}) exceeds remaining escrow balance ($${params.remainingContractBalance})`,
    };
  }

  return { allowed: true };
}

