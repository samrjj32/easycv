// confidenceCheck.ts
// Scores a parsed CV and decides if it needs AI fallback.

import { ParsedCv } from "./parseCvText";

export interface ConfidenceResult {
  score: number;       // 0–6
  level: "high" | "low";
  missing: string[];   // human-readable list of what's missing
}

export function checkConfidence(parsed: ParsedCv): ConfidenceResult {
  const missing: string[] = [];
  let score = 0;

  if (parsed.basic.name && parsed.basic.name.split(" ").length >= 2) {
    score++;
  } else {
    missing.push("name");
  }

  if (parsed.basic.email) {
    score++;
  } else {
    missing.push("email");
  }

  if (parsed.experience.length >= 1) {
    score++;
    // Extra point if experience has real company + position + date
    const hasRichExp = parsed.experience.some(e => e.company && e.position && e.date);
    if (hasRichExp) score++;
  } else {
    missing.push("work experience");
  }

  if (parsed.skillContent && parsed.skillContent.split(",").length >= 3) {
    score++;
  } else {
    missing.push("skills");
  }

  if (parsed.summaryContent && parsed.summaryContent.length > 50) {
    score++;
  }
  // Note: summary missing is not fatal — many CVs skip it

  return {
    score,
    level: score >= 4 ? "high" : "low",
    missing,
  };
}