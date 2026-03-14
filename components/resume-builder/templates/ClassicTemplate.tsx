"use client";

import { useResumeStore } from "@/lib/store/useResumeStore";

export function ClassicTemplate() {
  const { activeResume } = useResumeStore();
  if (!activeResume) return null;

  const {
    basic,
    experience,
    education,
    skills,
    skillContent,
    summaryContent = "",
    projects = [],
    customData = {},
    globalSettings,
    menuSections = [],
  } = activeResume;

  const gs = globalSettings;
  const themeColor = gs.themeColor || "#1a1a1a";
  const baseFontSize = gs.baseFontSize || 14;
  const pagePadding = gs.pagePadding || 64;
  const fontFamily = gs.fontFamily || "Times New Roman, serif";
  const sectionSpacing = gs.sectionSpacing || 32;
  const lineHeight = gs.lineHeight || 1.6;
  const headerSize = gs.headerSize || 18;
  const subheaderSize = gs.subheaderSize || 15;

  const layout = basic.layout || "center";
  const headerAlign =
    layout === "left" ? "text-left" : layout === "right" ? "text-right" : "text-center";
  const flexJustify =
    layout === "center" ? "justify-center" : layout === "right" ? "justify-end" : "justify-start";

  const enabledSections = menuSections.filter((s) => s.enabled).sort((a, b) => a.order - b.order);

  return (
    <div
      className="w-full bg-white shadow-xl min-h-[1100px] text-gray-900 leading-normal"
      style={{ fontFamily, padding: `${pagePadding}px`, fontSize: `${baseFontSize}px` }}
    >
      {/* Header */}
      <header className={`mb-10 pb-8 border-b border-gray-100 ${headerAlign}`}>
        <h1
          className="font-bold mb-2 tracking-wide text-gray-900 underline decoration-2 underline-offset-8"
          style={{ fontSize: "32px", textDecorationColor: themeColor }}
        >
          {basic.name || "YOUR NAME"}
        </h1>
        <p className="text-lg font-medium text-gray-600 mb-4">{basic.title || "Job Title"}</p>
        <div className={`flex flex-wrap gap-x-4 text-sm text-gray-600 ${flexJustify}`}>
          {basic.phone && <span>{basic.phone}</span>}
          {basic.email && <span>• {basic.email}</span>}
          {basic.location && <span>• {basic.location}</span>}
          {basic.employementStatus && <span>• {basic.employementStatus}</span>}
          {basic.customFields?.filter((f) => f.visible !== false).map((f) => (
            <span key={f.id}>• {f.value}</span>
          ))}
        </div>
      </header>

      {/* Dynamic Sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: `${sectionSpacing}px` }}>
        {enabledSections
          .filter((s) => s.id !== "basic")
          .map((section) => {
            switch (section.id) {
              case "experience": {
                const visible = experience.filter((e) => e.visible !== false);
                if (!visible.length) return null;
                return (
                  <section key={section.id}>
                    <h2
                      className="font-bold uppercase border-b-2 mb-4"
                      style={{ fontSize: `${headerSize}px`, borderColor: themeColor }}
                    >
                      {section.title}
                    </h2>
                    <div className="space-y-6">
                      {visible.map((exp) => (
                        <div key={exp.id}>
                          <div className="flex justify-between items-baseline mb-1">
                            <span className="font-bold" style={{ fontSize: `${subheaderSize}px` }}>
                              {exp.company}
                            </span>
                            <span className="text-sm font-medium text-gray-500">{exp.date}</span>
                          </div>
                          {exp.position && (
                            <div className="italic font-medium text-gray-700 mb-2">
                              {exp.position}
                            </div>
                          )}
                          {exp.details && (
                            <div
                              className="prose prose-sm max-w-none text-gray-700 prose-p:my-0 prose-ul:my-2"
                              dangerouslySetInnerHTML={{ __html: exp.details }}
                              style={{ lineHeight }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                );
              }

              case "education": {
                const visible = education.filter((e) => e.visible !== false);
                if (!visible.length) return null;
                return (
                  <section key={section.id}>
                    <h2
                      className="font-bold uppercase border-b-2 mb-4"
                      style={{ fontSize: `${headerSize}px`, borderColor: themeColor }}
                    >
                      {section.title}
                    </h2>
                    <div className="space-y-4">
                      {visible.map((edu) => (
                        <div key={edu.id}>
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-bold" style={{ fontSize: `${subheaderSize}px` }}>
                                {edu.school}
                              </span>
                              {(edu.degree || edu.major) && (
                                <div className="italic text-gray-700">
                                  {[edu.degree, edu.major].filter(Boolean).join(" · ")}
                                  {edu.gpa && ` · GPA ${edu.gpa}`}
                                </div>
                              )}
                            </div>
                            <span className="text-sm text-gray-500 shrink-0">
                              {edu.startDate && edu.endDate
                                ? `${edu.startDate} – ${edu.endDate}`
                                : edu.date || ""}
                            </span>
                          </div>
                          {edu.description && (
                            <div
                              className="mt-1 prose prose-sm max-w-none text-gray-700 prose-p:my-0.5"
                              dangerouslySetInnerHTML={{ __html: edu.description }}
                              style={{ lineHeight }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                );
              }

              case "skills": {
                const hasContent = skillContent && skillContent !== "<p></p>";
                const hasSkills = skills.length > 0;
                if (!hasContent && !hasSkills) return null;
                return (
                  <section key={section.id}>
                    <h2
                      className="font-bold uppercase border-b-2 mb-3"
                      style={{ fontSize: `${headerSize}px`, borderColor: themeColor }}
                    >
                      {section.title}
                    </h2>
                    {hasContent ? (
                      <div
                        className="prose prose-sm max-w-none prose-p:my-0.5 prose-ul:my-1 prose-li:my-0"
                        dangerouslySetInnerHTML={{ __html: skillContent }}
                        style={{ lineHeight }}
                      />
                    ) : (
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                        {skills.map((skill) => (
                          <div key={skill.id} className="flex items-center gap-2 text-sm text-gray-700">
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: themeColor }}
                            />
                            {skill.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                );
              }

              case "summary": {
                if (!summaryContent) return null;
                return (
                  <section key={section.id}>
                    <h2
                      className="font-bold uppercase border-b-2 mb-3"
                      style={{ fontSize: `${headerSize}px`, borderColor: themeColor }}
                    >
                      {section.title}
                    </h2>
                    <div
                      className="prose prose-sm max-w-none text-gray-700 prose-p:my-0.5"
                      dangerouslySetInnerHTML={{ __html: summaryContent }}
                      style={{ lineHeight }}
                    />
                  </section>
                );
              }

              case "projects": {
                const visible = projects.filter((p) => p.visible !== false);
                if (!visible.length) return null;
                return (
                  <section key={section.id}>
                    <h2
                      className="font-bold uppercase border-b-2 mb-4"
                      style={{ fontSize: `${headerSize}px`, borderColor: themeColor }}
                    >
                      {section.title}
                    </h2>
                    <div className="space-y-6">
                      {visible.map((proj) => (
                        <div key={proj.id}>
                          <div className="flex justify-between items-baseline mb-1">
                            <span className="font-bold" style={{ fontSize: `${subheaderSize}px` }}>
                              {proj.name}
                            </span>
                            {proj.date && (
                              <span className="text-sm font-medium text-gray-500">{proj.date}</span>
                            )}
                          </div>
                          {proj.role && (
                            <div className="italic font-medium text-gray-700">{proj.role}</div>
                          )}
                          {proj.link && (
                            <div className="text-blue-600 text-xs mt-0.5">{proj.link}</div>
                          )}
                          {proj.description && (
                            <div
                              className="mt-1 prose prose-sm max-w-none text-gray-700 prose-p:my-0 prose-ul:my-2"
                              dangerouslySetInnerHTML={{ __html: proj.description }}
                              style={{ lineHeight }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                );
              }

              default: {
                // Custom sections
                const items = (customData[section.id] || []).filter((i) => i.visible !== false);
                if (items.length === 0) return null;
                return (
                  <section key={section.id}>
                    <h2
                      className="font-bold uppercase border-b-2 mb-4"
                      style={{ fontSize: `${headerSize}px`, borderColor: themeColor }}
                    >
                      {section.title}
                    </h2>
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div key={item.id}>
                          <div className="flex justify-between items-baseline">
                            <span className="font-bold" style={{ fontSize: `${subheaderSize}px` }}>
                              {item.title}
                            </span>
                            {item.dateRange && (
                              <span className="text-sm text-gray-500">{item.dateRange}</span>
                            )}
                          </div>
                          {item.subtitle && (
                            <div className="italic text-gray-700">{item.subtitle}</div>
                          )}
                          {item.description && (
                            <div
                              className="mt-1 prose prose-sm max-w-none text-gray-700 prose-p:my-0.5"
                              dangerouslySetInnerHTML={{ __html: item.description }}
                              style={{ lineHeight }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                );
              }
            }
          })}
      </div>

      <div className="mt-20 border-t pt-8 text-center text-[10px] text-gray-400 uppercase tracking-widest">
        Generated by Magic Resume Builder
      </div>
    </div>
  );
}
