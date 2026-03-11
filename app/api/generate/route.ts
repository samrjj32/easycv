import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { CV_SYSTEM_PROMPT, COVER_LETTER_SYSTEM_PROMPT } from "@/lib/prompts";

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

export async function POST(req: NextRequest) {
  try {
    const { cv, jd } = await req.json();

    if (!cv || !jd) {
      return NextResponse.json(
        { error: "Both CV and job description are required." },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY is not set in .env.local" },
        { status: 500 }
      );
    }

    // Fire both AI calls in parallel
    const [tailoredCv, coverLetter] = await Promise.all([
      generateCv(cv, jd),
      generateCoverLetter(cv, jd),
    ]);

    return NextResponse.json({ tailoredCv, coverLetter });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
