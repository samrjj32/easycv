"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={handleCopy}
      style={{
        display: "flex", alignItems: "center", gap: 5,
        padding: "5px 11px",
        borderRadius: 6,
        border: "1px solid var(--border)",
        background: copied ? "var(--ok-bg)" : "var(--surface)",
        color: copied ? "var(--ok-text)" : "var(--text-2)",
        fontSize: 12,
        fontWeight: 500,
        cursor: "pointer",
        transition: "all 0.15s",
        whiteSpace: "nowrap",
        fontFamily: "var(--font-body)",
      }}
    >
      {copied ? (
        <>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          Copy
        </>
      )}
    </button>
  );
}

function OutputPanel({
  label,
  icon,
  content,
}: {
  label: string;
  icon: React.ReactNode;
  content: string;
}) {
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 12,
      overflow: "hidden",
    }}>
      {/* Panel header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-subtle)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ color: "var(--accent)" }}>{icon}</div>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
            {label}
          </span>
        </div>
        <CopyButton text={content} />
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "20px",
        fontSize: 13,
        lineHeight: 1.8,
        color: "var(--text-2)",
        whiteSpace: "pre-wrap",
        fontFamily: "'DM Mono', 'Fira Code', monospace",
        maxHeight: 600,
      }}>
        {content || (
          <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>
            No content yet.
          </span>
        )}
      </div>
    </div>
  );
}

export default function ResultsPage() {
  const [cvOutput, setCvOutput] = useState("");
  const [clOutput, setClOutput] = useState("");
  const router = useRouter();

  useEffect(() => {
    const cv = sessionStorage.getItem("autoapply_cv_output") || "";
    const cl = sessionStorage.getItem("autoapply_cl_output") || "";
    if (!cv && !cl) {
      router.push("/");
    } else {
      setCvOutput(cv);
      setClOutput(cl);
    }
  }, [router]);

  return (
    <div style={{ minHeight: "100svh", background: "var(--bg)" }}>
      <Nav active="/results" />

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px" }}>
        {/* Page header */}
        <div style={{
          display: "flex", alignItems: "flex-end",
          justifyContent: "space-between", flexWrap: "wrap",
          gap: 16, marginBottom: 28,
        }}>
          <div>
            <h1 style={{
              fontFamily: "var(--font-display)",
              fontSize: 32, fontWeight: 400,
              color: "var(--text)",
              letterSpacing: "-0.025em",
              marginBottom: 6,
            }}>
              Your documents
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-2)" }}>
              Tailored CV and cover letter, ready to paste or copy.
            </p>
          </div>
          <button
            onClick={() => router.push("/generate")}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 16px",
              borderRadius: 7,
              border: "1px solid var(--border)",
              background: "var(--surface)",
              color: "var(--text-2)",
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "var(--font-body)",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            New application
          </button>
        </div>

        {/* Output grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
          gap: 16,
        }}>
          <OutputPanel
            label="Tailored CV"
            content={cvOutput}
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            }
          />
          <OutputPanel
            label="Cover Letter"
            content={clOutput}
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            }
          />
        </div>

        {/* Tips */}
        <div style={{
          marginTop: 24,
          padding: "14px 18px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          fontSize: 12,
          color: "var(--text-muted)",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <span>
            These results are stored in session storage and will clear when you close this tab. Copy the text you need before leaving.
          </span>
        </div>
      </main>
    </div>
  );
}