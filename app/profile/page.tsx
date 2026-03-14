"use client";

import { useState, useEffect } from "react";
import { saveCv, loadCv } from "@/lib/cvStore";
import Nav from "@/components/Nav";

export default function ProfilePage() {
  const [cv, setCv] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => { setCv(loadCv()); }, []);

  function handleSave() {
    saveCv(cv);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const wordCount = cv.trim() ? cv.trim().split(/\s+/).length : 0;

  return (
    <div style={{ minHeight: "100svh", background: "var(--bg)" }}>
      <Nav active="/profile" />

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
            Master CV
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.6 }}>
            Paste your full CV here once. easycv rewrites it for each job without modifying this copy.
          </p>
        </div>

        {/* Info banner */}
        <div style={{
          padding: "14px 16px",
          background: "var(--accent-light)",
          border: "1px solid var(--border)",
          borderLeft: "3px solid var(--accent)",
          borderRadius: 8,
          marginBottom: 24,
          fontSize: 13,
          color: "var(--text-2)",
          lineHeight: 1.6,
        }}>
          <strong style={{ color: "var(--accent-text)", fontWeight: 600 }}>Tip:</strong>{" "}
          Formatting doesn't matter. Include everything — work history, skills, education, projects,
          certifications. The AI will restructure it for each JD.
        </div>

        {/* Textarea */}
        <div style={{ position: "relative" }}>
          <textarea
            value={cv}
            onChange={(e) => setCv(e.target.value)}
            placeholder="Paste your full CV here..."
            style={{
              width: "100%",
              minHeight: 480,
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
            }}
            onFocus={e => (e.target.style.borderColor = "var(--accent)")}
            onBlur={e => (e.target.style.borderColor = "var(--border)")}
          />
          {wordCount > 0 && (
            <div style={{
              position: "absolute", bottom: 12, right: 14,
              fontSize: 11, color: "var(--text-muted)",
              background: "var(--surface)",
              padding: "2px 6px",
              borderRadius: 4,
              pointerEvents: "none",
            }}>
              {wordCount.toLocaleString()} words
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={handleSave}
            disabled={!cv.trim()}
            style={{
              padding: "10px 22px",
              borderRadius: 7,
              fontSize: 14,
              fontWeight: 500,
              cursor: cv.trim() ? "pointer" : "not-allowed",
              border: "none",
              background: saved ? "var(--ok-bg)" : cv.trim() ? "var(--accent)" : "var(--bg-subtle)",
              color: saved ? "var(--ok-text)" : cv.trim() ? "white" : "var(--text-muted)",
              transition: "all 0.15s",
              letterSpacing: "-0.01em",
              display: "flex", alignItems: "center", gap: 7,
            }}
          >
            {saved ? (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Saved
              </>
            ) : "Save CV"}
          </button>

          {cv.trim() && !saved && (
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Ctrl + S to save
            </span>
          )}
        </div>
      </main>
    </div>
  );
}