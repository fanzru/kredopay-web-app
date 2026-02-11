import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

type TerminalStepStatus = "queued" | "processing" | "verified" | "failed";

interface TerminalStep {
  id: string;
  label: string;
  status: TerminalStepStatus;
  detail: string;
  updatedAt: number;
}

interface TerminalSession {
  id: string;
  userEmail: string;
  provider: string;
  status: "in_progress" | "complete" | "failed";
  createdAt: number;
  amount: number | null;
  currency: string;
  intentId: string | null;
  traceHash: string;
  etaSeconds: number;
  steps: TerminalStep[];
}

const sessionsByUser = new Map<string, TerminalSession[]>();

function getUserEmailFromToken(request: NextRequest): string | null {
  return request.headers.get("x-user-email");
}

function buildSession(params: {
  userEmail: string;
  amount?: number | null;
  currency?: string | null;
  intentId?: string | null;
  provider?: string | null;
}): TerminalSession {
  const now = Date.now();
  const provider = params.provider?.trim() || "Kredo Mixer Relay";
  const sessionId = `term-${now}-${Math.random().toString(36).slice(2, 9)}`;

  const steps: TerminalStep[] = [
    {
      id: "ingress",
      label: "Intent Ingress",
      status: "verified",
      detail: "Intent registered and sealed",
      updatedAt: now,
    },
    {
      id: "policy",
      label: "Policy Gate",
      status: "verified",
      detail: "Constraints validated without identity exposure",
      updatedAt: now,
    },
    {
      id: "mixer",
      label: "Mixer Relay",
      status: "processing",
      detail: "Decoupling funding source from spend path",
      updatedAt: now,
    },
    {
      id: "fog",
      label: "Fog Pool Split",
      status: "queued",
      detail: "Liquidity fragments assembled for release",
      updatedAt: now,
    },
    {
      id: "settlement",
      label: "Settlement Shield",
      status: "queued",
      detail: "Final routing shielded from attribution",
      updatedAt: now,
    },
  ];

  return {
    id: sessionId,
    userEmail: params.userEmail,
    provider,
    status: "in_progress",
    createdAt: now,
    amount: params.amount ?? null,
    currency: params.currency?.trim() || "USDC",
    intentId: params.intentId ?? null,
    traceHash: `0x${Math.random().toString(16).slice(2, 10)}${Math.random()
      .toString(16)
      .slice(2, 10)}`,
    etaSeconds: 45,
    steps,
  };
}

export async function GET(request: NextRequest) {
  try {
    const userEmail = getUserEmailFromToken(request);
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessions = sessionsByUser.get(userEmail) || [];
    return NextResponse.json({
      sessions,
      serverTime: Date.now(),
    });
  } catch (error) {
    console.error("Error fetching security terminal sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch security terminal sessions", sessions: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userEmail = getUserEmailFromToken(request);
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount, currency, intentId, provider } = body || {};

    if (amount !== undefined && (typeof amount !== "number" || amount <= 0)) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    const session = buildSession({
      userEmail,
      amount: typeof amount === "number" ? amount : null,
      currency: currency || null,
      intentId: intentId || null,
      provider: provider || null,
    });

    const existing = sessionsByUser.get(userEmail) || [];
    sessionsByUser.set(userEmail, [session, ...existing]);

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    console.error("Error creating security terminal session:", error);
    return NextResponse.json(
      { error: "Failed to create security terminal session" },
      { status: 500 }
    );
  }
}
