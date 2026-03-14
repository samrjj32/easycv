"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

const FEATURES = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 13h6M9 17h4"/>
      </svg>
    ),
    title: "7 professional templates",
    desc: "Pick a design that fits your industry. Minimal, classic, timeline, creative — all ATS-friendly.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    ),
    title: "Live preview as you type",
    desc: "See your CV update in real time. Drag sections, reorder, toggle visibility — no page reloads.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
    ),
    title: "Export to PDF instantly",
    desc: "One click. Perfect A4 formatting, print-ready. No watermarks, no sign-up required.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
    title: "AI tailoring per job",
    desc: "Paste a job description and get your CV rewritten with matched keywords and a cover letter.",
  },
];

const STEPS = [
  { n: "01", label: "Choose a template" },
  { n: "02", label: "Fill in your details" },
  { n: "03", label: "Export as PDF" },
];

export default function HomePage() {
  return (
    <div style={{ minHeight: "100svh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>

      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ height: 2, background: "var(--accent)", opacity: 0.8 }} />
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 28, height: 28, background: "var(--accent)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 19, fontWeight: 400, color: "var(--text)", letterSpacing: "-0.02em" }}>
              easycv
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Link href="/resume-builder" className="hidden sm:flex" style={{ fontSize: 13, color: "var(--text-2)", textDecoration: "none", padding: "5px 11px", borderRadius: 6 }}>Builder</Link>
            <Link href="/generate" className="hidden sm:flex" style={{ fontSize: 13, color: "var(--text-2)", textDecoration: "none", padding: "5px 11px", borderRadius: 6 }}>AI Tailor</Link>
            <div className="hidden sm:block" style={{ width: 1, height: 16, background: "var(--border)", margin: "0 6px" }} />
            <Link href="/resume-builder" style={{ fontSize: 13, fontWeight: 500, color: "white", textDecoration: "none", padding: "6px 14px", borderRadius: 6, background: "var(--accent)", whiteSpace: "nowrap" }}>
              Build my CV
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero */}
      <main style={{ flex: 1 }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "80px 24px 64px" }}>

          {/* Badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", border: "1px solid var(--border)", borderRadius: 100, marginBottom: 28, background: "var(--surface)" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)" }} />
            <span style={{ fontSize: 12, color: "var(--text-2)", fontWeight: 500, letterSpacing: "0.02em" }}>Free · No sign-up · Exports to PDF</span>
          </div>

          {/* Headline */}
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(44px, 7.5vw, 80px)", fontWeight: 400, lineHeight: 1.0, letterSpacing: "-0.035em", color: "var(--text)", maxWidth: 680, marginBottom: 22 }}>
            Build a great CV,{" "}
            <em style={{ fontStyle: "italic", color: "var(--accent)" }}>fast.</em>
          </h1>

          <p style={{ fontSize: 17, color: "var(--text-2)", maxWidth: 460, lineHeight: 1.7, marginBottom: 36 }}>
            Pick a template, fill in your details, and download a polished PDF in minutes.
            No clunky editors. No paywalls. Just your CV, done right.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 56 }}>
            <Link href="/resume-builder" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", background: "var(--accent)", color: "white", borderRadius: 8, fontWeight: 500, fontSize: 14, textDecoration: "none", letterSpacing: "-0.01em" }}>
              Start building — it&apos;s free
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
            <Link href="/generate" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 22px", background: "var(--surface)", color: "var(--text)", borderRadius: 8, fontWeight: 500, fontSize: 14, textDecoration: "none", border: "1px solid var(--border)", letterSpacing: "-0.01em" }}>
              AI-tailor to a job
            </Link>
          </div>

          {/* Steps */}
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0, marginBottom: 64 }}>
            {STEPS.map((s, i) => (
              <div key={s.n} style={{ display: "flex", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 13, color: "var(--accent)" }}>{s.n}</span>
                  <span style={{ fontSize: 13, color: "var(--text-2)", fontWeight: 500 }}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && <div style={{ width: 28, height: 1, background: "var(--border)", margin: "0 14px" }} />}
              </div>
            ))}
          </div>

          {/* Features */}
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 40 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20 }}>
              Everything included
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 1, background: "var(--border)", borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)" }}>
              {FEATURES.map((f, i) => (
                <div key={i} style={{ padding: "24px 22px", background: "var(--surface)" }}>
                  <div style={{ width: 34, height: 34, background: "var(--accent-light)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", marginBottom: 14 }}>
                    {f.icon}
                  </div>
                  <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 6, letterSpacing: "-0.01em" }}>{f.title}</h3>
                  <p style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.65 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "20px 24px", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
          easycv · Your data stays in your browser · Free forever
        </p>
      </footer>
    </div>
  );
}