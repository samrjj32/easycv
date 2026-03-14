"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadCv } from "@/lib/cvStore";
import Nav from "@/components/Nav";
import Link from "next/link";

export default function GeneratePage() {
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasCv, setHasCv] = useState(false);
  const router = useRouter();

  useEffect(() => { setHasCv(!!loadCv()); }, []);

  async function handleGenerate() {
    const cv = loadCv();
    if (!cv) { setError("Save your CV first — go to the My CV tab."); return; }
    if (!jd.trim()) { setError("Paste a job description first."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv, jd }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      sessionStorage.setItem("autoapply_cv_output", data.tailoredCv);
      sessionStorage.setItem("autoapply_cl_output", data.coverLetter);
      router.push("/results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100svh", background: "var(--bg)" }}>
      <Nav active="/generate" />

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px" }}>
        {/* Page header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: 32,
            fontWeight: 400,
            color: "var(--text)",
            letterSpacing: "-0.025em",
            marginBottom: 8,
          }}>
            Generate application
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-2)" }}>
            Paste a job description below. Your tailored CV and cover letter will be ready in ~15 seconds.
          </p>
        </div>

        {/* CV status */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "12px 16px",
          background: hasCv ? "var(--ok-bg)" : "var(--accent-light)",
          border: "1px solid var(--border)",
          borderLeft: `3px solid ${hasCv ? "var(--ok-text)" : "var(--accent)"}`,
          borderRadius: 8,
          marginBottom: 24,
          fontSize: 13,
        }}>
          <div style={{
            width: 18, height: 18, borderRadius: "50%",
            background: hasCv ? "var(--ok-text)" : "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            {hasCv ? (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            ) : (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            )}
          </div>
          <span style={{ color: "var(--text-2)" }}>
            {hasCv ? (
              "CV loaded and ready."
            ) : (
              <>
                No CV found.{" "}
                <Link href="/profile" style={{ color: "var(--accent)", textDecoration: "underline" }}>
                  Save your CV →
                </Link>
              </>
            )}
          </span>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: "12px 16px",
            background: "var(--err-bg)",
            border: "1px solid var(--border)",
            borderLeft: "3px solid var(--err-text)",
            borderRadius: 8,
            marginBottom: 20,
            fontSize: 13,
            color: "var(--err-text)",
          }}>
            {error}
          </div>
        )}

        {/* Label */}
        <label style={{
          display: "block",
          fontSize: 11, fontWeight: 600,
          color: "var(--text-muted)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: 8,
        }}>
          Job Description
        </label>

        {/* JD textarea */}
        <textarea
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          placeholder="Paste the full job description — title, responsibilities, requirements, company info, everything..."
          style={{
            width: "100%",
            minHeight: 380,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "18px 20px",
            fontSize: 14,
            color: "var(--text)",
            lineHeight: 1.75,
            resize: "vertical",
            fontFamily: "var(--font-body)",
            transition: "border-color 0.15s",
            display: "block",
          }}
          onFocus={e => (e.target.style.borderColor = "var(--accent)")}
          onBlur={e => (e.target.style.borderColor = "var(--border)")}
        />

        {/* Generate button */}
        <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 14 }}>
          <button
            onClick={handleGenerate}
            disabled={loading || !jd.trim() || !hasCv}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "11px 22px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              border: "none",
              cursor: (loading || !jd.trim() || !hasCv) ? "not-allowed" : "pointer",
              background: (loading || !jd.trim() || !hasCv) ? "var(--bg-subtle)" : "var(--accent)",
              color: (loading || !jd.trim() || !hasCv) ? "var(--text-muted)" : "white",
              transition: "all 0.15s",
              letterSpacing: "-0.01em",
            }}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: 14, height: 14, borderTopColor: "white", borderColor: "rgba(255,255,255,0.3)" }} />
                Generating...
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
                Generate CV + Cover Letter
              </>
            )}
          </button>

          {loading && (
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Both documents generated in parallel — usually 10–20 seconds
            </span>
          )}
        </div>
      </main>
    </div>
  );
}