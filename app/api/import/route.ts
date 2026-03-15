import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const PARSE_PROMPT = `You are a CV parser. Extract structured data from the CV text provided and return ONLY valid JSON — no markdown, no explanation, no backticks.

Return this exact JSON structure (use empty strings or empty arrays for missing fields, never null):

{
  "basic": {
    "name": "",
    "title": "",
    "email": "",
    "phone": "",
    "location": "",
    "employementStatus": ""
  },
  "summaryContent": "",
  "experience": [
    {
      "company": "",
      "position": "",
      "date": "",
      "details": ""
    }
  ],
  "education": [
    {
      "school": "",
      "degree": "",
      "major": "",
      "startDate": "",
      "endDate": "",
      "description": ""
    }
  ],
  "projects": [
    {
      "name": "",
      "role": "",
      "date": "",
      "description": "",
      "link": ""
    }
  ],
  "skillContent": ""
}

Rules:
- summaryContent: the professional summary/profile section as plain text
- skillContent: all skills as a single plain text string, e.g. "React, TypeScript, Node.js, PostgreSQL"
- experience details: bullet points as plain text, each on a new line starting with "• "
- education description: any relevant modules, grades, or notes
- Keep all text clean, no HTML tags
- dates as written in the CV e.g. "Jan 2022 – Present" or "2020 – 2022"
- If no projects found, return empty array
- Return ONLY the JSON object, nothing else`;

export async function POST(req: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "Service not configured." }, { status: 503 });
    }

    let body: { cvText?: unknown };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const { cvText } = body;

    if (typeof cvText !== "string" || !cvText.trim()) {
      return NextResponse.json({ error: "No CV text provided." }, { status: 400 });
    }

    if (cvText.trim().length < 100) {
      return NextResponse.json({ error: "CV text is too short. Please paste your full CV." }, { status: 400 });
    }

    if (cvText.length > 10_000) {
      return NextResponse.json({ error: "CV text is too long. Please trim to under 10,000 characters." }, { status: 400 });
    }

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 3000,
      system: PARSE_PROMPT,
      messages: [{
        role: "user",
        content: `Parse this CV:\n\n${cvText}`,
      }],
    });

    const raw = (message.content[0] as { text: string }).text.trim();

    // Parse and validate the JSON
    let parsed: Record<string, unknown>;
    try {
      // Strip any accidental markdown fences
      const cleaned = raw.replace(/^```json?\n?/, "").replace(/\n?```$/, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: "Failed to parse CV structure. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ data: parsed });

  } catch (err: unknown) {
    console.error("Import API error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
}