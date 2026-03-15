"use client";

import { ParsedCv } from "@/lib/parsers/parseCvText";

interface CvPreviewProps {
  data: ParsedCv;
  templateId: string;
  scale?: number;
}

const PAPER_W = 680;
const PAPER_H = 960;

// ── Section heading ───────────────────────────────────────
function SectionHeading({ label }: { label: string }) {
  return (
    <div style={{ marginTop: 22, marginBottom: 8 }}>
      <p style={{
        fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
        textTransform: "uppercase", color: "#111827", marginBottom: 4,
      }}>
        {label}
      </p>
      <div style={{ height: 1.5, background: "#111827", width: "100%" }} />
    </div>
  );
}

// ── Header — matches image 3 exactly ─────────────────────
function CvHeader({ data }: { data: ParsedCv }) {
  const { name, title, email, phone, location } = data.basic;

  // Build contact/link items
  const contactItems: string[] = [];
  if (email)    contactItems.push(email);
  if (phone)    contactItems.push(phone);
  if (data.basic.icons?.["linkedin"]) {
    // Show just the path part: linkedin.com/in/username
    const url = data.basic.icons["linkedin"];
    contactItems.push(url.replace(/^https?:\/\//, ""));
  }
  if (data.basic.icons?.["website"] || data.basic.icons?.["github"]) {
    const site = data.basic.icons["website"] || data.basic.icons["github"];
    contactItems.push(site.replace(/^https?:\/\//, ""));
  }
  if (location) contactItems.push(location);
 {console.log(name,"pppp")}
  return (
    <div style={{ textAlign: "center", padding: "28px 32px 16px", borderBottom: "1px solid #e5e5e5" }}>
      {/* Name — big, bold, centered */}
     
      <h1 style={{
        fontSize: 28, fontWeight: 700,
        color: "#111827", letterSpacing: "-0.01em",
        marginBottom: 8, lineHeight: 1.1,
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
      }}>
        {name || "Your Name"}
      </h1>

      {/* Contact line — separated by | */}
      {contactItems.length > 0 && (
        <p style={{
          fontSize: 10, color: "#555", lineHeight: 1.6,
          letterSpacing: "0.01em",
        }}>
          {contactItems.join("  |  ")}
        </p>
      )}

      {/* Job title below contact if present */}
      {title && (
        <p style={{ fontSize: 11, color: "#888", marginTop: 6, fontStyle: "italic" }}>
          {title}
        </p>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────
export default function CvPreview({ data, templateId, scale = 1 }: CvPreviewProps) {
  return (
    <div style={{
      width: PAPER_W * scale,
      height: PAPER_H * scale,
      overflow: "hidden",
      borderRadius: 4,
      boxShadow: "0 4px 32px rgba(0,0,0,0.14)",
      background: "white",
      flexShrink: 0,
    }}>
      <div style={{
        width: PAPER_W,
        height: PAPER_H,
        transformOrigin: "top left",
        transform: `scale(${scale})`,
        background: "white",
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
        color: "#111827",
        overflowY: "auto",
      }}>
        {/* Header */}
        <CvHeader data={data} />

        {/* Body */}
        <div style={{ padding: "4px 32px 32px" }}>

          {/* Summary */}
          {data.summaryContent && (
            <div>
              <SectionHeading label="Summary" />
              <p style={{ fontSize: 11, lineHeight: 1.7, color: "#374151" }}>
                {data.summaryContent}
              </p>
            </div>
          )}

          {/* Skills */}
          {data.skillContent && (
            <div>
              <SectionHeading label="Skills" />
              <p style={{ fontSize: 11, color: "#374151", lineHeight: 1.7 }}>
                {data.skillContent}
              </p>
            </div>
          )}

          {/* Experience */}
          {data.experience.length > 0 && (
            <div>
              <SectionHeading label="Work Experience" />
              {data.experience.slice(0, 4).map(job => (
                <div key={job.id} style={{ marginBottom: 16 }}>
                  {/* Title | Company | Date */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 4, marginBottom: 2 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>
                        {job.position || job.company}
                      </span>
                      {job.position && job.company && (
                        <>
                          <span style={{ fontSize: 11, color: "#9ca3af" }}>|</span>
                          <span style={{ fontSize: 11, color: "#2563eb", fontWeight: 500 }}>{job.company}</span>
                        </>
                      )}
                    </div>
                    <span style={{ fontSize: 10, color: "#6b7280", whiteSpace: "nowrap" }}>{job.date}</span>
                  </div>

                  {/* Bullet points — rendered as HTML */}
                  {job.details && (
                    <div
                      style={{ fontSize: 10.5, color: "#374151", lineHeight: 1.65, paddingLeft: 2 }}
                      dangerouslySetInnerHTML={{
                        __html: job.details
                          // Style the ul/li inline since we can't use CSS classes
                          .replace(/<ul>/g, '<ul style="margin:4px 0 0 14px;padding:0;">')
                          .replace(/<li>/g, '<li style="margin-bottom:3px;">')
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          {data.education.length > 0 && (
            <div>
              <SectionHeading label="Education" />
              {data.education.map(edu => (
                <div key={edu.id} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>{edu.degree}</span>
                    <span style={{ fontSize: 10, color: "#6b7280", whiteSpace: "nowrap", marginLeft: 8, flexShrink: 0 }}>
                      {[edu.startDate, edu.endDate].filter(Boolean).join(" – ")}
                    </span>
                  </div>
                  {edu.school && (
                    <p style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{edu.school}</p>
                  )}
                  {edu.description && (
                    <p style={{ fontSize: 10, color: "#9ca3af", marginTop: 2, lineHeight: 1.5 }}>{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Projects */}
          {data.projects.length > 0 && (
            <div>
              <SectionHeading label="Projects" />
              {data.projects.slice(0, 3).map(p => (
                <div key={p.id} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>{p.name}</span>
                    <span style={{ fontSize: 10, color: "#6b7280", marginLeft: 8, flexShrink: 0 }}>{p.date}</span>
                  </div>
                  {p.description && (
                    <p style={{ fontSize: 10, color: "#374151", lineHeight: 1.6, marginTop: 2 }}>
                      {p.description.slice(0, 140)}{p.description.length > 140 ? "…" : ""}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}