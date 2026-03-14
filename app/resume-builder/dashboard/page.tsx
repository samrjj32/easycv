"use client";

import { useResumeStore } from "@/lib/store/useResumeStore";
import { Plus, FileText, Copy, Trash2, Edit3, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import Nav from "@/components/Nav";

export default function ResumeDashboard() {
  const { resumes, createResume, deleteResume, duplicateResume, setActiveResume } = useResumeStore();
  const router = useRouter();

  const handleCreate = () => {
    const id = createResume();
    router.push(`/resume-builder?id=${id}`);
  };

  const handleEdit = (id: string) => {
    setActiveResume(id);
    router.push(`/resume-builder?id=${id}`);
  };

  const resumeList = Object.values(resumes).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div style={{ minHeight: "100svh", background: "var(--bg)" }}>
      <Nav />

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px" }}>
        {/* Header row */}
        <div style={{
          display: "flex", alignItems: "flex-end",
          justifyContent: "space-between",
          flexWrap: "wrap", gap: 16,
          marginBottom: 36,
        }}>
          <div>
            <h1 style={{
              fontFamily: "var(--font-display)",
              fontSize: 32, fontWeight: 400,
              color: "var(--text)",
              letterSpacing: "-0.025em",
              marginBottom: 6,
            }}>
              Your Resumes
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-2)" }}>
              {resumeList.length === 0
                ? "No resumes yet — create your first one."
                : `${resumeList.length} resume${resumeList.length > 1 ? "s" : ""}`}
            </p>
          </div>

          <button
            onClick={handleCreate}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "10px 20px",
              borderRadius: 8,
              border: "none",
              background: "var(--accent)",
              color: "white",
              fontSize: 14, fontWeight: 500,
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              letterSpacing: "-0.01em",
            }}
          >
            <Plus size={15} />
            New Resume
          </button>
        </div>

        {/* Empty state */}
        {resumeList.length === 0 ? (
          <div style={{
            padding: "72px 32px",
            textAlign: "center",
            border: "1px dashed var(--border)",
            borderRadius: 12,
            background: "var(--surface)",
          }}>
            <div style={{
              width: 48, height: 48,
              background: "var(--accent-light)",
              borderRadius: 12,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
              color: "var(--accent)",
            }}>
              <FileText size={22} />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
              No resumes yet
            </h2>
            <p style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 24, maxWidth: 320, margin: "0 auto 24px" }}>
              Build a professional resume with one of our templates and export as PDF.
            </p>
            <button
              onClick={handleCreate}
              style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                padding: "9px 18px",
                borderRadius: 7,
                border: "1px solid var(--border)",
                background: "var(--surface-2)",
                color: "var(--text)",
                fontSize: 14, fontWeight: 500,
                cursor: "pointer",
                fontFamily: "var(--font-body)",
              }}
            >
              <Plus size={14} /> Create Resume
            </button>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 16,
          }}>
            {resumeList.map((resume) => (
              <div
                key={resume.id}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                  transition: "border-color 0.15s, box-shadow 0.15s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-strong)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                }}
              >
                {/* Card top */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div style={{
                    width: 40, height: 40,
                    background: "var(--accent-light)",
                    borderRadius: 10,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--accent)",
                  }}>
                    <FileText size={18} />
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 4 }}>
                    <button
                      onClick={() => duplicateResume(resume.id)}
                      title="Duplicate"
                      style={iconBtn}
                    >
                      <Copy size={13} />
                    </button>
                    <button
                      onClick={() => deleteResume(resume.id)}
                      title="Delete"
                      style={{ ...iconBtn, color: "var(--err-text)" }}
                    >
                      <Trash2 size={13} />
                    </button>
                    <Link
                      href={`/resume-builder?id=${resume.id}`}
                      target="_blank"
                      title="Open in new tab"
                      style={{ ...iconBtn, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <ExternalLink size={13} />
                    </Link>
                  </div>
                </div>

                {/* Title + date */}
                <div>
                  <h3 style={{
                    fontSize: 15, fontWeight: 600,
                    color: "var(--text)",
                    letterSpacing: "-0.015em",
                    marginBottom: 4,
                  }}>
                    {resume.title || "Untitled Resume"}
                  </h3>
                  <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    Edited {format(new Date(resume.updatedAt), "MMM d, yyyy")}
                  </p>
                </div>

                {/* Edit button */}
                <button
                  onClick={() => handleEdit(resume.id)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    padding: "8px 0",
                    borderRadius: 7,
                    border: "1px solid var(--border)",
                    background: "var(--surface-2)",
                    color: "var(--text)",
                    fontSize: 13, fontWeight: 500,
                    cursor: "pointer",
                    fontFamily: "var(--font-body)",
                    transition: "background 0.12s",
                    width: "100%",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-subtle)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "var(--surface-2)")}
                >
                  <Edit3 size={12} />
                  Edit Resume
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

const iconBtn: React.CSSProperties = {
  width: 28, height: 28,
  display: "flex", alignItems: "center", justifyContent: "center",
  borderRadius: 6,
  border: "1px solid var(--border)",
  background: "var(--surface-2)",
  color: "var(--text-2)",
  cursor: "pointer",
  fontFamily: "var(--font-body)",
  transition: "all 0.12s",
};