import { prisma } from "./db";
import { ContractStatus, MilestoneStatus } from "@/types";

export interface CreateContractInput {
  title: string;
  description: string;
  category: string;
  totalBudget: number;
  currency?: string;
  clientEmail: string;
  clientName: string;
  freelancerEmail: string;
  freelancerName: string;
  milestones: Array<{
    title: string;
    description: string;
    amount: number;
    orderIndex: number;
    acceptanceCriteria: Array<{
      id: string;
      description: string;
      weight: number;
      required: boolean;
      type: "TEST_COVERAGE" | "FEATURE_COMPLETION" | "SCHEMA_VALIDATION" | "CODE_QUALITY" | "ARTIFACT_PRESENCE";
    }>;
  }>;
}

// In-memory fallback repository when Neon DB is not yet plugged in or during offline testing
const inMemoryContracts: Map<string, any> = new Map();

export async function createContract(data: CreateContractInput) {
  const isDbAvailable = Boolean(process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("ep-cool-sample"));

  if (isDbAvailable) {
    try {
      // Ensure Client user exists
      const client = await prisma.user.upsert({
        where: { email: data.clientEmail },
        update: { name: data.clientName },
        create: {
          email: data.clientEmail,
          name: data.clientName,
          role: "CLIENT",
        },
      });

      // Ensure Freelancer user exists
      const freelancer = await prisma.user.upsert({
        where: { email: data.freelancerEmail },
        update: { name: data.freelancerName },
        create: {
          email: data.freelancerEmail,
          name: data.freelancerName,
          role: "FREELANCER",
          paypalEmail: data.freelancerEmail,
        },
      });

      const contract = await prisma.contract.create({
        data: {
          title: data.title,
          description: data.description,
          category: data.category,
          totalBudget: data.totalBudget,
          currency: data.currency || "USD",
          status: "DRAFT",
          clientId: client.id,
          freelancerId: freelancer.id,
          milestones: {
            create: data.milestones.map((m) => ({
              title: m.title,
              description: m.description,
              amount: m.amount,
              orderIndex: m.orderIndex,
              status: "PENDING",
              acceptanceCriteria: JSON.stringify(m.acceptanceCriteria),
            })),
          },
        },
        include: {
          client: true,
          freelancer: true,
          milestones: true,
        },
      });

      return contract;
    } catch (dbErr) {
      console.warn("[ContractsRepo] Database write failed. Falling back to in-memory store:", dbErr);
    }
  }

  // In-memory simulation fallback
  const contractId = "pact_" + Math.random().toString(36).substring(2, 9);
  const now = new Date();

  const simulatedContract = {
    id: contractId,
    title: data.title,
    description: data.description,
    category: data.category,
    totalBudget: data.totalBudget,
    currency: data.currency || "USD",
    status: "DRAFT" as ContractStatus,
    clientId: "usr_client_demo",
    freelancerId: "usr_dev_demo",
    client: {
      id: "usr_client_demo",
      name: data.clientName,
      email: data.clientEmail,
      role: "CLIENT",
    },
    freelancer: {
      id: "usr_dev_demo",
      name: data.freelancerName,
      email: data.freelancerEmail,
      paypalEmail: data.freelancerEmail,
      role: "FREELANCER",
    },
    milestones: data.milestones.map((m, idx) => ({
      id: `ms_${contractId}_${idx + 1}`,
      contractId: contractId,
      title: m.title,
      description: m.description,
      amount: m.amount,
      orderIndex: m.orderIndex,
      status: "PENDING" as MilestoneStatus,
      acceptanceCriteria: JSON.stringify(m.acceptanceCriteria),
      deliverableUrl: null,
      deliverableNotes: null,
      submissionHash: null,
      payoutBatchId: null,
      createdAt: now,
      updatedAt: now,
      audits: [],
    })),
    transactions: [],
    disputes: [],
    paypalOrderId: null,
    paypalCaptureId: null,
    createdAt: now,
    updatedAt: now,
  };

  inMemoryContracts.set(contractId, simulatedContract);
  return simulatedContract;
}

export async function getContractById(contractId: string) {
  const isDbAvailable = Boolean(process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("ep-cool-sample"));

  if (isDbAvailable) {
    try {
      const contract = await prisma.contract.findUnique({
        where: { id: contractId },
        include: {
          client: true,
          freelancer: true,
          milestones: {
            orderBy: { orderIndex: "asc" },
            include: { audits: { orderBy: { createdAt: "desc" } } },
          },
          transactions: { orderBy: { createdAt: "desc" } },
          disputes: true,
        },
      });

      if (contract) return contract;
    } catch (err) {
      console.warn("[ContractsRepo] DB fetch failed, checking in-memory store:", err);
    }
  }

  return inMemoryContracts.get(contractId) || null;
}

export async function updateContractStatus(
  contractId: string,
  status: ContractStatus,
  paypalData?: { paypalOrderId?: string; paypalCaptureId?: string }
) {
  const isDbAvailable = Boolean(process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("ep-cool-sample"));

  if (isDbAvailable) {
    try {
      return await prisma.contract.update({
        where: { id: contractId },
        data: {
          status,
          ...(paypalData?.paypalOrderId ? { paypalOrderId: paypalData.paypalOrderId } : {}),
          ...(paypalData?.paypalCaptureId ? { paypalCaptureId: paypalData.paypalCaptureId } : {}),
          ...(status === "ESCROW_LOCKED" ? { escrowLockedAt: new Date() } : {}),
        },
      });
    } catch (err) {
      console.warn("[ContractsRepo] DB update failed, falling back to in-memory:", err);
    }
  }

  const existing = inMemoryContracts.get(contractId);
  if (existing) {
    existing.status = status;
    if (paypalData?.paypalOrderId) existing.paypalOrderId = paypalData.paypalOrderId;
    if (paypalData?.paypalCaptureId) existing.paypalCaptureId = paypalData.paypalCaptureId;
    if (status === "ESCROW_LOCKED") existing.escrowLockedAt = new Date();
    inMemoryContracts.set(contractId, existing);
    return existing;
  }
  return null;
}

export async function updateMilestoneSubmission(
  milestoneId: string,
  data: {
    deliverableUrl?: string;
    deliverableNotes?: string;
    submissionHash: string;
  }
) {
  const isDbAvailable = Boolean(process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("ep-cool-sample"));

  if (isDbAvailable) {
    try {
      return await prisma.milestone.update({
        where: { id: milestoneId },
        data: {
          status: "SUBMITTED",
          deliverableUrl: data.deliverableUrl,
          deliverableNotes: data.deliverableNotes,
          submissionHash: data.submissionHash,
          submittedAt: new Date(),
        },
      });
    } catch (err) {
      console.warn("[ContractsRepo] DB milestone update failed:", err);
    }
  }

  // In-memory update
  for (const contract of inMemoryContracts.values()) {
    const ms = contract.milestones.find((m: any) => m.id === milestoneId);
    if (ms) {
      ms.status = "SUBMITTED";
      ms.deliverableUrl = data.deliverableUrl;
      ms.deliverableNotes = data.deliverableNotes;
      ms.submissionHash = data.submissionHash;
      ms.submittedAt = new Date();
      return ms;
    }
  }
  return null;
}

export async function updateMilestonePaid(
  milestoneId: string,
  payoutBatchId: string
) {
  const isDbAvailable = Boolean(process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("ep-cool-sample"));

  if (isDbAvailable) {
    try {
      return await prisma.milestone.update({
        where: { id: milestoneId },
        data: {
          status: "PAID",
          payoutBatchId,
          paidAt: new Date(),
        },
      });
    } catch (err) {
      console.warn("[ContractsRepo] DB milestone paid update failed:", err);
    }
  }

  for (const contract of inMemoryContracts.values()) {
    const ms = contract.milestones.find((m: any) => m.id === milestoneId);
    if (ms) {
      ms.status = "PAID";
      ms.payoutBatchId = payoutBatchId;
      ms.paidAt = new Date();
      return ms;
    }
  }
  return null;
}

export async function listAllContracts() {
  const isDbAvailable = Boolean(process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("ep-cool-sample"));

  if (isDbAvailable) {
    try {
      return await prisma.contract.findMany({
        include: {
          client: true,
          freelancer: true,
          milestones: true,
          transactions: true,
          disputes: true,
        },
        orderBy: { createdAt: "desc" },
      });
    } catch (err) {
      console.warn("[ContractsRepo] DB list failed, using memory:", err);
    }
  }

  return Array.from(inMemoryContracts.values());
}

export async function resolveMilestoneDispute(params: {
  contractId: string;
  milestoneId: string;
  clientReason: string;
  devCounter?: string;
  resolution: {
    decision: string;
    refundAmount: number;
    releaseAmount: number;
    analysis: string;
    bindingTerms: string[];
    confidenceScore: number;
  };
  payoutBatchId?: string;
}) {
  const isDbAvailable = Boolean(process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("ep-cool-sample"));

  if (isDbAvailable) {
    try {
      // 1. Update milestone status
      await prisma.milestone.update({
        where: { id: params.milestoneId },
        data: {
          status: "DISPUTED",
          payoutBatchId: params.payoutBatchId || null,
        },
      });

      // 2. Create Dispute record
      const dispute = await prisma.dispute.create({
        data: {
          contractId: params.contractId,
          reason: params.clientReason,
          status:
            params.resolution.decision === "REFUND_ALL"
              ? "RESOLVED_REFUND"
              : params.resolution.decision === "RELEASE_ALL"
              ? "RESOLVED_RELEASE"
              : "RESOLVED_PARTIAL",
          clientClaim: params.clientReason,
          devCounter: params.devCounter,
          aiResolution: JSON.stringify(params.resolution),
          refundAmount: params.resolution.refundAmount,
          releaseAmount: params.resolution.releaseAmount,
          resolvedAt: new Date(),
        },
      });

      return dispute;
    } catch (err) {
      console.warn("[ContractsRepo] DB dispute resolution failed:", err);
    }
  }

  // In-memory update
  for (const contract of inMemoryContracts.values()) {
    const ms = contract.milestones?.find((m: any) => m.id === params.milestoneId);
    if (ms) {
      ms.status = "DISPUTED";
      ms.payoutBatchId = params.payoutBatchId || null;
      ms.disputeResolution = params.resolution;

      const dispute = {
        id: `disp_${Date.now()}`,
        contractId: params.contractId,
        reason: params.clientReason,
        status: params.resolution.decision,
        clientClaim: params.clientReason,
        devCounter: params.devCounter,
        aiResolution: JSON.stringify(params.resolution),
        refundAmount: params.resolution.refundAmount,
        releaseAmount: params.resolution.releaseAmount,
        resolvedAt: new Date(),
      };
      contract.disputes = contract.disputes || [];
      contract.disputes.push(dispute);
      return dispute;
    }
  }
  return null;
}

