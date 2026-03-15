"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Nav from "@/components/Nav";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { parseCvText, ParsedCv } from "@/lib/parsers/parseCvText";
import { checkConfidence } from "@/lib/parsers/confidenceCheck";

const CvPreview = dynamic(() => import("@/components/cv-preview/CvPreview"), { ssr: false });

const DEFAULT_TEMPLATE = "modern";

type Step = "upload" | "preview";

async function extractText(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") {
    const { extractTextFromPdf } = await import("@/lib/parsers/extractPdf");
    return extractTextFromPdf(file);
  }
  if (ext === "docx" || ext === "doc") {
    const { extractTextFromDocx } = await import("@/lib/parsers/extractDocx");
    return extractTextFromDocx(file);
  }
  return file.text();
}

export default function ImportPage() {
  const router = useRouter();
  const { createResume, updateResume, setActiveSection } = useResumeStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep]               = useState<Step>("upload");
  const [file, setFile]               = useState<File | null>(null);
  const [extracting, setExtracting]   = useState(false);
  const [statusMsg, setStatusMsg]     = useState("");
  const [extractError, setExtractError] = useState("");
  const [parsed, setParsed]           = useState<ParsedCv | null>(null);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [dragging, setDragging]       = useState(false);

  // ── File processing ─────────────────────────────────────
  async function processFile(f: File) {
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "doc", "docx", "txt"].includes(ext || "")) {
      setExtractError("Please upload a PDF, Word (.docx), or text file.");
      return;
    }

    setFile(f);
    setExtracting(true);
    setExtractError("");
    setStatusMsg("Reading file…");

    try {
      const text = await extractText(f);
      if (!text || text.trim().length < 50) {
        setExtractError("Couldn't read enough text from this file. Try a different format.");
        setExtracting(false);
        return;
      }

      setStatusMsg("Parsing your CV…");
      const regexData = parseCvText(text);
      const confidence = checkConfidence(regexData);

      if (confidence.level === "high") {
        setParsed(regexData);
        setMissingFields([]);
        setStep("preview");
      } else {
        setStatusMsg("Your CV format needs a closer look — using AI…");
        try {
          const res = await fetch("/api/import", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cvText: text }),
          });
          const json = await res.json();

          if (res.ok && json.data) {
            const uid = () => Math.random().toString(36).substring(2, 9);
            const d = json.data;
            const aiParsed: ParsedCv = {
              basic: {
                name: d.basic?.name || "", title: d.basic?.title || "",
                email: d.basic?.email || "", phone: d.basic?.phone || "",
                location: d.basic?.location || "", employementStatus: d.basic?.employementStatus || "",
                birthDate: "", photo: "", icons: {},
                photoConfig: { width: 100, height: 100, aspectRatio: "1:1", borderRadius: "full", customBorderRadius: 0, visible: true },
                customFields: [], githubKey: "", githubUseName: "",
                githubContributionsVisible: false, layout: "left",
              },
              summaryContent: d.summaryContent || "",
              skillContent: d.skillContent || "",
              experience: (d.experience || []).map((e: Record<string,string>, i: number) => ({
                id: uid(), position: e.position || "", company: e.company || "",
                date: e.date || "",
                details: e.details
                  ? "<ul>" + e.details.split("\n").filter((l: string) => l.trim()).map((l: string) => "<li>" + l.replace(/^[•●\-*]\s*/, "") + "</li>").join("") + "</ul>"
                  : "",
                visible: true, order: i,
              })),
              education: (d.education || []).map((e: Record<string,string>, i: number) => ({
                id: uid(), degree: e.degree || "", school: e.school || "",
                major: e.major || "", startDate: e.startDate || "",
                endDate: e.endDate || "", description: e.description || "",
                visible: true, order: i,
              })),
              projects: (d.projects || []).map((p: Record<string,string>, i: number) => ({
                id: uid(), name: p.name || "", role: p.role || "",
                date: p.date || "", description: p.description || "",
                link: p.link || "", visible: true, order: i,
              })),
              skills: [],
            };
            setParsed(aiParsed);
            setMissingFields([]);
            setStep("preview");
          } else {
            // AI failed — use regex with warning
            setParsed(regexData);
            setMissingFields(confidence.missing);
            setStep("preview");
          }
        } catch {
          setParsed(regexData);
          setMissingFields(confidence.missing);
          setStep("preview");
        }
      }
    } catch (err) {
      console.error("Extraction error:", err);
      setExtractError("Failed to read the file. Please try a PDF or .docx format.");
    } finally {
      setExtracting(false);
      setStatusMsg("");
    }
  }

  // ── Drag and drop ────────────────────────────────────────
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  }, []);
  const onDragOver  = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragging(true); }, []);
  const onDragLeave = useCallback(() => setDragging(false), []);

  // ── Open in builder ──────────────────────────────────────
  function openInBuilder() {
    if (!parsed) return;
    const id = createResume(DEFAULT_TEMPLATE);
    updateResume(id, {
      title: `${parsed.basic.name || "Imported"} CV`,
      templateId: DEFAULT_TEMPLATE,
      ...parsed,
    });
    setActiveSection("basic");
    router.push(`/resume-builder?id=${id}`);
  }

  // ── Render ───────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100svh", background: "var(--bg)" }}>
      <Nav active="/import" />

      <main style={{ maxWidth: 920, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* Page header */}
        <div style={{ marginBottom: 36 }}>
          <h1 style={{
            fontFamily: "var(--font-display)", fontSize: 34, fontWeight: 400,
            color: "var(--text)", letterSpacing: "-0.025em", marginBottom: 8,
          }}>
            Import your CV
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.6 }}>
            {step === "upload"
              ? "Upload your file — we'll read it instantly and show you a preview."
              : "Here's how your CV looks. Click 'Start editing' to open it in the builder."}
          </p>
        </div>

        {/* Step bar — just 2 steps now */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 44 }}>
          {[{ key: "upload", label: "Upload" }, { key: "preview", label: "Preview & edit" }].map((s, i) => {
            const done   = i === 0 && step === "preview";
            const active = step === s.key;
            return (
              <div key={s.key} style={{ display: "flex", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700,
                    background: active ? "var(--accent)" : done ? "var(--ok-bg)" : "var(--surface-2)",
                    color:      active ? "white"         : done ? "var(--ok-text)" : "var(--text-muted)",
                    border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                  }}>
                    {done
                      ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      : i + 1}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? "var(--text)" : "var(--text-muted)" }}>
                    {s.label}
                  </span>
                </div>
                {i === 0 && <div style={{ width: 32, height: 1, background: "var(--border)", margin: "0 12px" }} />}
              </div>
            );
          })}
        </div>

        {/* ── STEP 1: Upload ── */}
        {step === "upload" && (
          <div style={{ maxWidth: 560 }}>
            <div
              onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${dragging ? "var(--accent)" : "var(--border)"}`,
                borderRadius: 14, padding: "56px 32px", textAlign: "center",
                cursor: "pointer",
                background: dragging ? "var(--accent-light)" : "var(--surface)",
                transition: "all 0.15s",
              }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 12,
                background: "var(--surface-2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px",
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                  stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>

              <p style={{ fontSize: 15, fontWeight: 500, color: "var(--text)", marginBottom: 6 }}>
                {extracting ? (statusMsg || "Reading your CV…") : "Drop your CV here"}
              </p>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                or <span style={{ color: "var(--accent)", textDecoration: "underline" }}>click to browse</span>
              </p>
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 12 }}>
                PDF, Word (.docx), or plain text — up to 10 MB
              </p>

              {extracting && (
                <div style={{ marginTop: 20, display: "flex", justifyContent: "center" }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%",
                    border: "2px solid var(--border)", borderTopColor: "var(--accent)",
                    animation: "spin 0.7s linear infinite",
                  }} />
                </div>
              )}
            </div>

            <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt"
              style={{ display: "none" }}
              onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f); }}
            />

            {extractError && (
              <div style={{
                marginTop: 16, padding: "12px 16px",
                background: "var(--err-bg)", borderLeft: "3px solid var(--err-text)",
                borderRadius: 8, fontSize: 13, color: "var(--err-text)",
              }}>
                {extractError}
              </div>
            )}

            {file && !extracting && !extractError && (
              <div style={{
                marginTop: 14, padding: "10px 14px",
                background: "var(--ok-bg)", borderRadius: 8,
                fontSize: 12, color: "var(--ok-text)",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                {file.name}
              </div>
            )}

            {/* Start from scratch */}
            <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--border)" }}>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 10 }}>No CV yet?</p>
              <button
                onClick={() => { const id = createResume(DEFAULT_TEMPLATE); router.push(`/resume-builder?id=${id}`); }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  padding: "9px 18px", borderRadius: 7,
                  border: "1px solid var(--border)", background: "var(--surface)",
                  color: "var(--text-2)", fontSize: 13, fontWeight: 500,
                  cursor: "pointer", fontFamily: "var(--font-body)",
                }}
              >
                Start from scratch →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Preview ── */}
        {step === "preview" && parsed && (
          <div>
            {/* Missing fields warning */}
            {missingFields.length > 0 && (
              <div style={{
                padding: "12px 14px", marginBottom: 20,
                background: "var(--accent-light)", borderLeft: "3px solid var(--accent)",
                borderRadius: 8, fontSize: 12, color: "var(--text-2)", lineHeight: 1.6,
              }}>
                <strong style={{ color: "var(--text)", display: "block", marginBottom: 3 }}>
                  Some fields weren't detected:
                </strong>
                {missingFields.join(", ")} — you can fill these in the builder.
              </div>
            )}

            <style>{`
              @media (max-width: 680px) {
                .preview-row { flex-direction: column !important; }
                .preview-left { max-width: 100% !important; flex: 1 1 auto !important; }
                .preview-right { width: 100% !important; overflow-x: auto !important; justify-content: flex-start !important; }
              }
            `}</style>
            <div className="preview-row" style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>

              {/* Left: actions + extracted — always on top on mobile */}
              <div className="preview-left" style={{ flex: "1 1 220px", minWidth: "200px", maxWidth: "260px" }}>
                <p style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 24, lineHeight: 1.6 }}>
                  This is a preview of your imported CV. Hit <strong style={{ color: "var(--text)" }}>Start editing</strong> to open it in the builder.
                </p>

                <button
                  onClick={openInBuilder}
                  style={{
                    width: "100%", display: "flex", alignItems: "center",
                    justifyContent: "center", gap: 8,
                    padding: "13px 20px", borderRadius: 9, border: "none",
                    background: "var(--accent)", color: "white",
                    fontSize: 14, fontWeight: 500, cursor: "pointer",
                    fontFamily: "var(--font-body)", marginBottom: 10,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Start editing
                </button>

                <button
                  onClick={() => { setStep("upload"); setParsed(null); setFile(null); setExtractError(""); }}
                  style={{
                    width: "100%", padding: "9px 20px", borderRadius: 7,
                    border: "1px solid var(--border)", background: "transparent",
                    color: "var(--text-muted)", fontSize: 12, cursor: "pointer",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  ← Upload a different file
                </button>

                {/* Extracted data summary */}
                <div style={{
                  marginTop: 24, padding: "14px", background: "var(--surface)",
                  border: "1px solid var(--border)", borderRadius: 10,
                }}>
                  <p style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
                    Extracted
                  </p>
                  {[
                    { label: "Name",       value: parsed.basic.name.split(" ").slice(0,3).join(" ") },
                    { label: "Email",      value: parsed.basic.email },
                    { label: "Phone",      value: parsed.basic.phone },
                    { label: "Location",   value: parsed.basic.location },
                    { label: "Jobs",       value: parsed.experience.length ? `${parsed.experience.length} found` : "" },
                    { label: "Education",  value: parsed.education.length  ? `${parsed.education.length} found`  : "" },
                    { label: "Skills",     value: parsed.skillContent ? "Found" : "" },
                    { label: "Summary",    value: parsed.summaryContent ? "Found" : "" },
                  ].map(row => (
                    <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{row.label}</span>
                      {row.value
                        ? <span style={{ fontSize: 11, color: "var(--ok-text)", fontWeight: 500 }}>✓ {row.value}</span>
                        : <span style={{ fontSize: 11, color: "var(--err-text)" }}>— missing</span>
                      }
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: CV preview — below on mobile */}
              <div className="preview-right" style={{ flex: 1, display: "flex", justifyContent: "center", overflow: "hidden", minWidth: 0 }}>
                <CvPreview data={parsed} templateId={DEFAULT_TEMPLATE} scale={0.72} />
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}