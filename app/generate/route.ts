import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { CV_SYSTEM_PROMPT, COVER_LETTER_SYSTEM_PROMPT } from "@/lib/prompts";

// ─────────────────────────────────────────────────────────
// RATE LIMITER
// Simple in-memory store: { ip -> { count, windowStart } }
// Each IP gets MAX_REQUESTS per WINDOW_MS
// This resets when the server restarts — good enough for
// Vercel serverless (each cold start = fresh limiter)
// ─────────────────────────────────────────────────────────
const WINDOW_MS = 60 * 60 * 1000; // 1 hour window
const MAX_REQUESTS = 3;            // max 3 generations per IP per hour

const rateLimitStore = new Map<string, { count: number; windowStart: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record) {
    // First request from this IP
    rateLimitStore.set(ip, { count: 1, windowStart: now });
    return false;
  }

  const windowExpired = now - record.windowStart > WINDOW_MS;

  if (windowExpired) {
    // Reset the window
    rateLimitStore.set(ip, { count: 1, windowStart: now });
    return false;
  }

  if (record.count >= MAX_REQUESTS) {
    return true; // blocked
  }

  // Increment count
  record.count += 1;
  rateLimitStore.set(ip, record);
  return false;
}

// Clean up old entries every 100 requests to avoid memory leak
let cleanupCounter = 0;
function maybeCleanup() {
  cleanupCounter++;
  if (cleanupCounter < 100) return;
  cleanupCounter = 0;
  const now = Date.now();
  rateLimitStore.forEach((record, ip) => {
    if (now - record.windowStart > WINDOW_MS) {
      rateLimitStore.delete(ip);
    }
  });
}

// ─────────────────────────────────────────────────────────
// INPUT LIMITS
// Prevent massive inputs that burn tokens fast
// ─────────────────────────────────────────────────────────
const MAX_CV_CHARS = 8_000;   // ~1,500 words — a full CV
const MAX_JD_CHARS = 5_000;   // ~900 words — a full job description
const MIN_CV_CHARS = 100;
const MIN_JD_CHARS = 50;

// ─────────────────────────────────────────────────────────
// ANTHROPIC CLIENT
// ─────────────────────────────────────────────────────────
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function generateCv(cv: string, jd: string): Promise<string> {
  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2000,
    system: CV_SYSTEM_PROMPT,
    messages: [{
      role: "user",
      content: `Here is my current CV:\n\n${cv}\n\n---\n\nHere is the job description I am applying for:\n\n${jd}`,
    }],
  });
  return (message.content[0] as { text: string }).text;
}

async function generateCoverLetter(cv: string, jd: string): Promise<string> {
  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1500,
    system: COVER_LETTER_SYSTEM_PROMPT,
    messages: [{
      role: "user",
      content: `Here is my CV:\n\n${cv}\n\n---\n\nHere is the job description:\n\n${jd}`,
    }],
  });
  return (message.content[0] as { text: string }).text;
}

// ─────────────────────────────────────────────────────────
// MAIN HANDLER
// ─────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {

    // ── 1. Check API key is configured ──────────────────
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "Service not configured. Contact support." },
        { status: 503 }
      );
    }

    // ── 2. Get real IP (works on Vercel) ─────────────────
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

    // ── 3. Rate limit check ──────────────────────────────
    maybeCleanup();
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. You can generate up to 3 CVs per hour. Please wait before trying again." },
        { status: 429 }
      );
    }

    // ── 4. Parse body ────────────────────────────────────
    let body: { cv?: unknown; jd?: unknown };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request format." },
        { status: 400 }
      );
    }

    const { cv, jd } = body;

    // ── 5. Type checks ───────────────────────────────────
    if (typeof cv !== "string" || typeof jd !== "string") {
      return NextResponse.json(
        { error: "CV and job description must be text." },
        { status: 400 }
      );
    }

    // ── 6. Empty checks ──────────────────────────────────
    if (!cv.trim() || !jd.trim()) {
      return NextResponse.json(
        { error: "Both CV and job description are required." },
        { status: 400 }
      );
    }

    // ── 7. Minimum length — catch nonsense/test inputs ───
    if (cv.trim().length < MIN_CV_CHARS) {
      return NextResponse.json(
        { error: "CV is too short. Please paste your full CV." },
        { status: 400 }
      );
    }

    if (jd.trim().length < MIN_JD_CHARS) {
      return NextResponse.json(
        { error: "Job description is too short. Please paste the full listing." },
        { status: 400 }
      );
    }

    // ── 8. Maximum length — prevent token abuse ──────────
    if (cv.length > MAX_CV_CHARS) {
      return NextResponse.json(
        { error: `CV is too long (max ${MAX_CV_CHARS} characters). Please trim it down.` },
        { status: 400 }
      );
    }

    if (jd.length > MAX_JD_CHARS) {
      return NextResponse.json(
        { error: `Job description is too long (max ${MAX_JD_CHARS} characters). Please trim it.` },
        { status: 400 }
      );
    }

    // ── 9. Basic content check — catch random junk ───────
    const cvWords = cv.trim().split(/\s+/).length;
    const jdWords = jd.trim().split(/\s+/).length;

    if (cvWords < 20) {
      return NextResponse.json(
        { error: "CV doesn't look complete. Please paste your full CV." },
        { status: 400 }
      );
    }

    if (jdWords < 10) {
      return NextResponse.json(
        { error: "Job description doesn't look complete." },
        { status: 400 }
      );
    }

    // ── 10. Fire both AI calls in parallel ───────────────
    const [tailoredCv, coverLetter] = await Promise.all([
      generateCv(cv, jd),
      generateCoverLetter(cv, jd),
    ]);

    return NextResponse.json({ tailoredCv, coverLetter });

  } catch (err: unknown) {
    // Handle Anthropic-specific errors
    if (err instanceof Error) {
      // Credits exhausted
      if (err.message.includes("credit") || err.message.includes("billing")) {
        return NextResponse.json(
          { error: "Service temporarily unavailable. Please try again later." },
          { status: 503 }
        );
      }

      // Rate limited by Anthropic itself
      if (err.message.includes("rate_limit") || err.message.includes("429")) {
        return NextResponse.json(
          { error: "Service is busy right now. Please try again in a moment." },
          { status: 429 }
        );
      }
    }

    // Generic error — don't leak internal details to the user
    console.error("Generate API error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

// Block all other HTTP methods
export async function GET() {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
}