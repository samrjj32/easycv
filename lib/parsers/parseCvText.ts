// parseCvText.ts
// Handles real-world PDF-extracted CV text including:
// - Wrapped bullet points (pdf2json splits long lines)
// - Pipe-format experience: "Title | Company | Date | Location"
// - Categorised skills: "Languages: JS, TS"
// - ALL CAPS section headings

export interface ParsedCv {
  basic: {
    name: string; title: string; email: string; phone: string;
    location: string; employementStatus: string; birthDate: string;
    photo: string; icons: Record<string, string>;
    photoConfig: { width: number; height: number; aspectRatio: string; borderRadius: string; customBorderRadius: number; visible: boolean };
    customFields: unknown[]; githubKey: string; githubUseName: string;
    githubContributionsVisible: boolean; layout: string;
  };
  summaryContent: string;
  skillContent: string;
  experience: Array<{ id: string; company: string; position: string; date: string; details: string; visible: boolean; order: number }>;
  education: Array<{ id: string; school: string; degree: string; major: string; startDate: string; endDate: string; description: string; visible: boolean; order: number }>;
  projects: Array<{ id: string; name: string; role: string; date: string; description: string; link: string; visible: boolean; order: number }>;
  skills: unknown[];
}

const uid = () => Math.random().toString(36).substring(2, 9);

// ── Section heading map ───────────────────────────────────────────────────────
const SECTION_MAP: Array<{ keys: string[]; name: string }> = [
  { keys: ["summary", "profile", "about me", "personal statement", "objective", "professional summary", "career objective"], name: "summary" },
  { keys: ["work experience", "experience", "employment", "work history", "career history", "professional experience", "employment history"], name: "experience" },
  { keys: ["education", "academic background", "qualifications", "academic qualifications", "studies"], name: "education" },
  { keys: ["skills", "technical skills", "key skills", "core competencies", "competencies", "technologies", "tools", "tech stack"], name: "skills" },
  { keys: ["projects", "personal projects", "side projects", "portfolio"], name: "projects" },
  { keys: ["certifications", "certification", "certificates", "certificate", "accreditations", "professional development", "licenses", "courses"], name: "certifications" },
  { keys: ["community", "memberships", "volunteer", "interests", "hobbies", "additional information", "additional info"], name: "other" },
];

function getSectionName(line: string): string | null {
  const clean = line.toLowerCase().replace(/[:\-–—|]/g, "").trim();
  for (const { keys, name } of SECTION_MAP) {
    if (keys.some(k => clean === k)) return name;
  }
  return null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function isBullet(line: string): boolean {
  return /^[●•\-\*▸◦–▪►]/.test(line);
}
function stripBullet(line: string): string {
  return line.replace(/^[●•\-\*▸◦–▪►]\s*/, "").trim();
}

const DATE_RX = /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?|\d{4}|present|current|now)\b/i;
const DEG_RX  = /\b(bsc|ba|beng|msc|meng|ma|mba|phd|llb|hnd|btec|bachelor|master|doctor|diploma|a.?level|gcse|degree|foundation|honours|hons|b\.tech|m\.tech)\b/i;

function extractDateRange(text: string): string {
  const m = text.match(
    /((?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{4}|\d{4})\s*[-–—to]+\s*((?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{4}|\d{4}|present|current|now)/i
  );
  return m ? m[0].trim() : "";
}

function isJobHeader(line: string): boolean {
  // Pipe format: "Title | Company | Date" or just contains a date range and is short
  return (line.includes("|") && DATE_RX.test(line)) ||
         (extractDateRange(line).length > 0 && line.length < 120);
}

// ── STEP 1: Join wrapped lines ────────────────────────────────────────────────
// pdf2json wraps long bullet points across multiple lines.
// We stitch continuation lines back onto the line they belong to.
// A continuation line is one that:
//   - doesn't start with a bullet
//   - doesn't look like a section heading
//   - doesn't look like a job header (pipe + date)
//   - doesn't look like a degree line
//   - starts with a lowercase letter OR starts mid-sentence
function joinWrappedLines(rawLines: string[]): string[] {
  const result: string[] = [];

  for (const line of rawLines) {
    if (!line.trim()) continue;
    const clean = line.trim();

    const isSection   = getSectionName(clean) !== null && clean.length < 60;
    const isBull      = isBullet(clean);
    const isHeader    = isJobHeader(clean);
    const isDegree    = DEG_RX.test(clean) && clean.length < 100;
    // Continuation: starts lowercase OR starts with lowercase after stripping punctuation
    const isContinuation =
      !isSection && !isBull && !isHeader && !isDegree &&
      result.length > 0 &&
      /^[a-z]/.test(clean);

    if (isContinuation) {
      // Append to previous line with a space
      result[result.length - 1] += " " + clean;
    } else {
      result.push(clean);
    }
  }

  return result;
}

// ── STEP 2: Split into sections ───────────────────────────────────────────────
function splitSections(lines: string[]): Record<string, string[]> {
  const sections: Record<string, string[]> = {
    header: [], summary: [], experience: [], education: [],
    skills: [], projects: [], certifications: [], other: [],
  };
  let current = "header";

  for (const line of lines) {
    const sec = getSectionName(line);
    if (sec && line.length < 60) {
      current = sec;
    } else {
      sections[current].push(line);
    }
  }

  return sections;
}

// ── Contact extractors ────────────────────────────────────────────────────────
function extractEmail(text: string)    { return (text.match(/[\w.+\-]+@[\w\-]+\.[a-z]{2,}/i) || [""])[0]; }
function extractPhone(text: string)    { return ((text.match(/(\+?[\d][\d\s\-().]{6,16}\d)/) || [""])[0]).trim(); }
function extractLinkedIn(text: string) { const m = text.match(/linkedin\.com\/in\/([\w\-]+)/i); return m ? `https://linkedin.com/in/${m[1]}` : ""; }
function extractGithub(text: string)   { const m = text.match(/github\.com\/([\w\-]+)/i); return m ? m[1] : ""; }
function extractWebsite(text: string) {
  const m = text.match(/website[:\s]+([\w\-./]+)/i) || text.match(/\bwww\.((?!linkedin|github)[a-z0-9\-]+\.[a-z0-9\-.]+)/i);
  if (!m) return "";
  const raw = m[1] || m[0];
  return raw.startsWith("http") ? raw : `https://${raw}`;
}
function extractLocation(text: string) {
  const addr = text.match(/address[:\s]+([^\n]+)/i);
  if (addr) return addr[1].trim();
  const m = text.match(/\b([A-Z][a-zA-Z\-]+(?:\s[A-Z][a-zA-Z\-]+)?,\s*[A-Z]{2,}[a-zA-Z\s]*)\b/);
  return m ? m[1].trim() : "";
}

// ── Experience parser ─────────────────────────────────────────────────────────
function parseExperience(lines: string[]): ParsedCv["experience"] {
  interface RawJob { position: string; company: string; date: string; bullets: string[] }
  const jobs: ParsedCv["experience"] = [];
  let cur: RawJob | null = null;

  const flush = () => {
    if (cur && (cur.position || cur.company)) {
      jobs.push({
        id: uid(),
        position: cur.position,
        company:  cur.company,
        date:     cur.date,
        details:  cur.bullets.length > 0 ? `<ul>${cur.bullets.map(b => `<li>${b}</li>`).join("")}</ul>` : "",
        visible:  true,
        order:    jobs.length,
      });
    }
    cur = null;
  };

  for (const line of lines) {
    // ── Bullet point → add to current job ──
    if (isBullet(line)) {
      if (!cur) cur = { position: "", company: "", date: "", bullets: [] };
      cur.bullets.push(stripBullet(line));
      continue;
    }

    // ── Pipe-separated job header ──
    // e.g. "FullStack Developer | Hubble Bubble LTD | Jan 2025 – Present | Manchester (hybrid)"
    if (line.includes("|") && DATE_RX.test(line)) {
      flush();
      const parts = line.split("|").map(p => p.trim()).filter(Boolean);
      cur = { position: "", company: "", date: "", bullets: [] };
      for (const part of parts) {
        const d = extractDateRange(part);
        if (d && !cur.date) {
          cur.date = d;
        } else if (!cur.position) {
          cur.position = part;
        } else if (!cur.company) {
          cur.company = part;
        }
        // 4th part (location) — skip
      }
      continue;
    }

    // ── Page break markers from pdf2json ──
    if (/^-+Page\s*\(\d+\)\s*Break-+$/i.test(line)) continue;

    // ── Continuation of a bullet (starts lowercase, wrapped line) ──
    if (cur && cur.bullets.length > 0 && /^[a-z]/.test(line)) {
      cur.bullets[cur.bullets.length - 1] += " " + line;
      continue;
    }

    // ── Short line with a date range but no pipe → new job header ──
    const date = extractDateRange(line);
    if (date && line.length < 100 && !line.includes("|")) {
      if (cur && !cur.date) {
        cur.date = date;
      } else {
        flush();
        cur = { position: line.replace(date, "").replace(/[-–—|,\s]+$/, "").trim(), company: "", date, bullets: [] };
      }
      continue;
    }

    // ── Short non-bullet, no date → company or title line ──
    if (line.length < 80 && !DATE_RX.test(line)) {
      if (!cur) {
        cur = { position: line, company: "", date: "", bullets: [] };
      } else if (!cur.position) {
        cur.position = line;
      } else if (!cur.company) {
        cur.company = line;
      } else {
        flush();
        cur = { position: line, company: "", date: "", bullets: [] };
      }
      continue;
    }

    // ── Long non-bullet line → treat as a bullet detail ──
    if (cur) {
      cur.bullets.push(line);
    }
  }

  flush();
  return jobs.filter(j => j.position || j.company).slice(0, 10);
}

// ── Skills parser ─────────────────────────────────────────────────────────────
function parseSkills(lines: string[]): string {
  const all: string[] = [];
  for (const line of lines) {
    const withoutLabel = line.replace(/^[\w\s&\/]+\s*:+\s*/, "");
    const parts = withoutLabel
      .split(/[,;|·\t\/]+/)
      .map(s => s.replace(/^[●•\-\*▸◦–▪►\s]+/, "").trim())
      .filter(s => s.length > 1 && s.length < 50 && !/^\d+$/.test(s));
    all.push(...parts);
  }
  return [...new Set(all)].join(", ");
}

// ── Education parser ──────────────────────────────────────────────────────────
function parseEducation(lines: string[]): ParsedCv["education"] {
  const items: ParsedCv["education"] = [];
  let cur: { degree: string; school: string; dates: string; desc: string[] } | null = null;

  const flush = () => {
    if (cur?.degree || cur?.school) {
      const parts = cur!.dates.split(/[-–—to]+/i).map(s => s.trim());
      items.push({
        id: uid(), degree: cur!.degree, school: cur!.school, major: "",
        startDate: parts[0] || "", endDate: parts[1] || "",
        description: cur!.desc.join(" ").trim(),
        visible: true, order: items.length,
      });
    }
    cur = null;
  };

  for (const line of lines) {
    if (isBullet(line)) { if (cur) cur.desc.push(stripBullet(line)); continue; }

    // Pipe format: "Degree | University | 2013 – 2017"
    if (line.includes("|")) {
      flush();
      const parts = line.split("|").map(p => p.trim());
      const date  = extractDateRange(line);
      cur = { degree: parts[0] || "", school: parts[1] || "", dates: date || parts[2] || "", desc: [] };
      continue;
    }

    if (DEG_RX.test(line)) {
      flush();
      cur = { degree: line, school: "", dates: extractDateRange(line), desc: [] };
      continue;
    }

    const date = extractDateRange(line);
    if (date && cur && !cur.dates) { cur.dates = date; continue; }
    if (cur && !cur.school && line.length < 100) { cur.school = line; continue; }
    if (cur) cur.desc.push(line);
  }

  flush();
  return items.slice(0, 5);
}

// ── Projects parser ───────────────────────────────────────────────────────────
function parseProjects(lines: string[]): ParsedCv["projects"] {
  const items: ParsedCv["projects"] = [];
  let cur: { name: string; date: string; desc: string[]; link: string } | null = null;

  const flush = () => {
    if (cur?.name) {
      items.push({ id: uid(), name: cur.name, role: "", date: cur.date,
        description: cur.desc.join(" ").trim(), link: cur.link, visible: true, order: items.length });
    }
  };

  for (const line of lines) {
    const url = line.match(/https?:\/\/[^\s]+/);
    if (url) { if (cur) cur.link = url[0]; continue; }
    if (isBullet(line)) { if (cur) cur.desc.push(stripBullet(line)); continue; }
    const date = extractDateRange(line);
    if (!cur) { cur = { name: line, date: date || "", desc: [], link: "" }; }
    else { flush(); cur = { name: line, date: date || "", desc: [], link: "" }; }
  }
  flush();
  return items.slice(0, 6);
}

// ── Main export ───────────────────────────────────────────────────────────────
export function parseCvText(raw: string): ParsedCv {
  // Strip pdf2json page break markers e.g. "---------------Page (0) Break----------------"
  const cleaned = raw.replace(/-{3,}Page\s*\(\d+\)\s*Break-{3,}/gi, "").trim();

  // Step 1: split into raw lines
  const rawLines = cleaned.split("\n").map(l => l.trim()).filter(Boolean);

  // Step 2: join pdf-wrapped continuation lines
  const joined = joinWrappedLines(rawLines);

  // Step 3: split into sections
  const sections = splitSections(joined);

  // Contact
  const email    = extractEmail(raw);
  const phone    = extractPhone(raw);
  const location = extractLocation(raw);
  const linkedin = extractLinkedIn(raw);
  const github   = extractGithub(raw);
  const website  = extractWebsite(raw);

  // Name
  const header = sections.header || [];

  // Helper: extract clean name from a line that may contain contact info
  function cleanName(raw: string): string {
    return raw
      .split(/[|@]/)[0]           // take part before | or @
      .replace(/\s*\|.*$/, "")    // remove anything after pipe
      .replace(/\s{2,}/g, " ")    // collapse spaces
      // Remove trailing word that looks like start of email (no vowels pattern / all lowercase no spaces)
      .replace(/\s+[a-z][a-z0-9._%+\-]{3,}$/, "")
      .trim();
  }

  const nameLine = header.find(l =>
    !l.includes("@") && !/^\+?\d/.test(l) &&
    !l.match(/linkedin|github|http|www\.|address/i) &&
    l.split(" ").length >= 2 && l.split(" ").length <= 5 &&
    l.length < 50 && /^[A-Z]/.test(l)
  ) || header[0] || "";

  // If the found line still has contact info merged in, clean it
  const name = cleanName(nameLine);

  // Title (job title — line after name)
  const nameIdx = header.indexOf(nameLine);
  const title = header.slice(nameIdx + 1).find(l =>
    !l.includes("@") && !/^\+?\d/.test(l) &&
    !l.match(/linkedin|github|http|www\.|address/i) &&
    l.length > 3 && l.length < 80 && !DATE_RX.test(l)
  ) || "";

  const summaryContent = sections.summary
    .join(" ")
    .replace(/^(summary|profile|about|objective):?\s*/i, "")
    .trim();

  const icons: Record<string, string> = {};
  if (linkedin) icons["linkedin"] = linkedin;
  if (website)  icons["website"]  = website;
  if (github)   icons["github"]   = `https://github.com/${github}`;

  return {
    basic: {
      name, title, email, phone, location,
      employementStatus: "", birthDate: "", photo: "", icons,
      photoConfig: { width: 100, height: 100, aspectRatio: "1:1", borderRadius: "full", customBorderRadius: 0, visible: true },
      customFields: [], githubKey: "", githubUseName: github,
      githubContributionsVisible: false, layout: "left",
    },
    summaryContent,
    skillContent: parseSkills(sections.skills || []),
    experience:   parseExperience(sections.experience || []),
    education:    parseEducation(sections.education || []),
    projects:     parseProjects(sections.projects || []),
    skills: [],
  };
}