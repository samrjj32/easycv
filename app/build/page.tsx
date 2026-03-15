"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import { useResumeStore } from "@/lib/store/useResumeStore";

export default function BuildPage() {
  const router = useRouter();
  const { createResume } = useResumeStore();

  function startBlank() {
    const id = createResume("modern");
    router.push(`/resume-builder?id=${id}`);
  }

  return (
    <div style={{ minHeight: "100svh", background: "var(--bg)" }}>
      <Nav />

      <main style={{
        maxWidth: 760,
        margin: "0 auto",
        padding: "72px 24px 80px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}>

        {/* Heading */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: 38, fontWeight: 400,
            color: "var(--text)",
            letterSpacing: "-0.025em",
            marginBottom: 12,
          }}>
            How do you want to start?
          </h1>
          <p style={{ fontSize: 15, color: "var(--text-2)", lineHeight: 1.6 }}>
            Import an existing CV and we'll fill everything in for you,
            or start fresh and build from a blank template.
          </p>
        </div>

        {/* Choice cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          width: "100%",
          maxWidth: 600,
        }}>

          {/* Import card */}
          <Link href="/import" style={{ textDecoration: "none" }}>
            <div
              role="button"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 14,
                padding: "32px 24px",
                cursor: "pointer",
                transition: "all 0.15s",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 0,
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = "var(--accent)";
                el.style.boxShadow = "0 0 0 3px var(--accent-light)";
                el.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = "var(--border)";
                el.style.boxShadow = "none";
                el.style.transform = "translateY(0)";
              }}
            >
              {/* Icon */}
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: "var(--accent-light)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 18,
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>

              <h2 style={{
                fontSize: 17, fontWeight: 600,
                color: "var(--text)",
                marginBottom: 8, letterSpacing: "-0.01em",
              }}>
                Import my CV
              </h2>
              <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6, margin: 0 }}>
                Upload a PDF or Word file. We'll extract your info and fill the builder automatically.
              </p>

              {/* Badge */}
              <div style={{
                marginTop: 20,
                display: "inline-flex", alignItems: "center", gap: 5,
                background: "var(--ok-bg)",
                border: "1px solid var(--border)",
                borderRadius: 20,
                padding: "3px 10px",
                fontSize: 11, fontWeight: 500, color: "var(--ok-text)",
              }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--ok-text)" }} />
                Recommended
              </div>
            </div>
          </Link>

          {/* Start blank card */}
          <div
            role="button"
            onClick={startBlank}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: "32px 24px",
              cursor: "pointer",
              transition: "all 0.15s",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 0,
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.borderColor = "var(--border-strong)";
              el.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.borderColor = "var(--border)";
              el.style.transform = "translateY(0)";
            }}
          >
            {/* Icon */}
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: "var(--surface-2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 18,
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="var(--text-2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </div>

            <h2 style={{
              fontSize: 17, fontWeight: 600,
              color: "var(--text)",
              marginBottom: 8, letterSpacing: "-0.01em",
            }}>
              Start from scratch
            </h2>
            <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6, margin: 0 }}>
              Open a blank template and fill in your details yourself, section by section.
            </p>
          </div>

        </div>

        {/* Footnote */}
        <p style={{
          marginTop: 36, fontSize: 12, color: "var(--text-muted)",
          textAlign: "center", lineHeight: 1.6,
        }}>
          Both options are completely free. No account needed.
        </p>

      </main>
    </div>
  );
}