// app/api/import/route.ts
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PARSE_PROMPT = `You are an expert CV/resume parser. Extract structured data from any CV regardless of format, language, or layout.

Return ONLY valid JSON — no markdown, no backticks, no explanation, no preamble.

Return this exact structure (empty strings / empty arrays for missing fields, NEVER null or undefined):

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
    { "company": "", "position": "", "date": "", "details": "" }
  ],
  "education": [
    { "school": "", "degree": "", "major": "", "startDate": "", "endDate": "", "description": "" }
  ],
  "projects": [
    { "name": "", "role": "", "date": "", "description": "", "link": "" }
  ],
  "skillContent": "",
  "extraSections": [
    {
      "id": "",
      "title": "",
      "icon": "",
      "items": [
        { "title": "", "subtitle": "", "dateRange": "", "description": "" }
      ]
    }
  ]
}

FIELD RULES:

name: Full candidate name — usually the largest text at the top. May be ALL CAPS or bold.
title: Current or most recent job title / professional headline.
email / phone / location: Extract as written.
employementStatus: Only if CV explicitly states availability or notice period. Otherwise "".
summaryContent: The professional summary/profile as plain text. Do not generate one if absent.

experience: All work history.
  - date: Exact as written, do not reformat.
  - details: All bullets as plain text, each line starting with "• ". Preserve everything.

education: ACADEMIC qualifications ONLY — university degrees, diplomas, A-levels, HNDs.
  DO NOT put online courses, certifications, or bootcamps here — those go in extraSections.

projects: Personal/side projects only (not work projects). Return [] if none.

skillContent: All skills as a single plain text string, preserving any categories from the CV.

extraSections: EVERY section not covered by the fixed fields above.
  This includes but is not limited to:
  - Certificates / Certifications / Licences (online courses, professional certs, bootcamps)
  - Community / Memberships / Volunteering
  - Awards / Achievements / Honours
  - Publications / Patents / Research
  - Languages (spoken)
  - Interests / Hobbies
  - Additional Information / Other
  - Any other named section in the CV

  For EACH extra section:
  - id: lowercase, hyphenated slug of the title (e.g. "certificates", "community-memberships", "additional-information")
  - title: Section heading exactly as it appears in the CV
  - icon: A single relevant emoji for this section type:
      certificates/licences → 🏆
      community/memberships/volunteering → 👥
      awards/achievements → 🌟
      publications/research → 📄
      languages → 🌍
      interests/hobbies → 🎯
      additional/other/info → ℹ️
      (use your best judgement for anything else)
  - items: Array of items in that section. For each item map to:
      title: The primary label (course/cert name, award name, community name, etc.)
      subtitle: Issuer, organisation, or secondary label (e.g. "Udemy", "HackerRank", "WCM")
      dateRange: Date or date range as written. "" if none.
      description: Any descriptive text, notes, or additional detail. "" if none.

  If a section has only a single block of text with no clear list items, create one item with title="" and put the full text in description.
  Return [] for extraSections if no extra sections exist.

IMPORTANT:
- Non-Latin names are common — extract accurately.
- Return ONLY the JSON object. No other text.`;

export async function POST(req: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "Service not configured." }, { status: 503 });
    }

    let body: { cvText?: unknown };
    try { body = await req.json(); }
    catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }

    const { cvText } = body;
    if (typeof cvText !== "string" || !cvText.trim()) {
      return NextResponse.json({ error: "No CV text provided." }, { status: 400 });
    }
    if (cvText.trim().length < 50) {
      return NextResponse.json({ error: "CV text is too short to parse." }, { status: 400 });
    }

    const trimmed = cvText.length > 12_000 ? cvText.slice(0, 12_000) : cvText;

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4000,
      system: PARSE_PROMPT,
      messages: [{ role: "user", content: `Parse this CV:\n\n${trimmed}` }],
    });

    const raw = (message.content[0] as { text: string }).text.trim();

    let parsed: Record<string, unknown>;
    try {
      const cleaned = raw.replace(/^```json?\n?/, "").replace(/\n?```$/, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", raw.slice(0, 500));
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