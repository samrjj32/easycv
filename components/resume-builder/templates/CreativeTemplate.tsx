"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Icons from "lucide-react";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { BasicInfo, Education, Experience, GlobalSettings, Skill, Project, CustomItem } from "@/lib/types/resume";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getIcon(iconName: string | undefined) {
  if (!iconName) return null;
  const Comp = (Icons as unknown as Record<string, React.ElementType>)[iconName];
  return Comp ? <Comp className="w-4 h-4" /> : null;
}

// ---------------------------------------------------------------------------
// Section heading — simple bold with color
// ---------------------------------------------------------------------------
function SectionHeading({ title, themeColor, headerSize }: { title: string; themeColor: string; headerSize: number }) {
  return (
    <h3
      className="font-bold mb-3 pb-1 border-b"
      style={{ fontSize: `${headerSize}px`, color: themeColor, borderColor: `${themeColor}33` }}
    >
      {title}
    </h3>
  );
}

// ---------------------------------------------------------------------------
// Basic Info Header — bold colored block
// ---------------------------------------------------------------------------
function BasicInfoSection({
  basic,
  themeColor,
  baseFontSize,
}: {
  basic: BasicInfo;
  themeColor: string;
  baseFontSize: number;
}) {
  const layout = basic.layout || "left";
  const alignClass =
    layout === "center" ? "text-center" : layout === "right" ? "text-right" : "text-left";
  const flexJustify =
    layout === "center" ? "justify-center" : layout === "right" ? "justify-end" : "justify-start";

  const allFields = [
    basic.email && { key: "email", value: basic.email, icon: basic.icons?.email || "Mail" },
    basic.phone && { key: "phone", value: basic.phone, icon: basic.icons?.phone || "Phone" },
    basic.location && { key: "location", value: basic.location, icon: basic.icons?.location || "MapPin" },
    basic.employementStatus && { key: "status", value: basic.employementStatus, icon: basic.icons?.employementStatus || "Briefcase" },
    ...(basic.customFields?.filter((f) => f.visible !== false).map((f) => ({
      key: f.id,
      value: f.value,
      icon: f.icon || "User",
    })) || []),
  ].filter(Boolean) as { key: string; value: string; icon: string }[];

  return (
    <div
      className="w-full rounded-2xl px-8 py-8 mb-6"
      style={{ backgroundColor: themeColor, color: "#ffffff" }}
    >
      <div className={`${layout === "left" ? "flex gap-6 items-center" : ""}`}>
        <div className={`flex-1 min-w-0 ${alignClass}`}>
          <h1 className="font-bold leading-tight" style={{ fontSize: "28px" }}>
            {basic.name || "YOUR NAME"}
          </h1>
          {basic.title && (
            <p className="font-medium mt-0.5 opacity-80" style={{ fontSize: "16px" }}>
              {basic.title}
            </p>
          )}
          {allFields.length > 0 && (
            <div
              className={`flex flex-wrap gap-x-5 gap-y-1.5 mt-3 opacity-90 ${flexJustify}`}
              style={{ fontSize: `${baseFontSize}px` }}
            >
              {allFields.map((item) => (
                <div key={item.key} className="flex items-center gap-1.5">
                  {getIcon(item.icon)}
                  <span>{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Experience section
// ---------------------------------------------------------------------------
function ExperienceSection({
  experiences,
  globalSettings,
  title,
}: {
  experiences: Experience[];
  globalSettings: GlobalSettings;
  title: string;
}) {
  const visible = experiences.filter((e) => e.visible !== false);
  if (!visible.length) return null;
  const { themeColor = "#18181b", baseFontSize = 14, subheaderSize = 15, sectionSpacing = 24, paragraphSpacing = 8, lineHeight = 1.6, headerSize = 16 } = globalSettings;

  return (
    <div style={{ marginTop: `${sectionSpacing}px` }}>
      <SectionHeading title={title} themeColor={themeColor} headerSize={headerSize} />
      <AnimatePresence mode="popLayout">
        {visible.map((exp) => (
          <motion.div key={exp.id} layout="position" style={{ marginBottom: `${paragraphSpacing * 2}px` }}>
            <div className="flex items-center justify-between gap-4">
              <span className="font-bold truncate" style={{ fontSize: `${subheaderSize}px` }}>
                {exp.company}
              </span>
              <span className="text-gray-500 shrink-0 text-right" style={{ fontSize: `${subheaderSize - 1}px` }}>
                {exp.date}
              </span>
            </div>
            {exp.position && (
              <div className="text-gray-600 italic" style={{ fontSize: `${subheaderSize - 1}px` }}>
                {exp.position}
              </div>
            )}
            {exp.details && (
              <div
                className="mt-1 prose prose-sm max-w-none prose-p:my-0.5 prose-ul:my-1 prose-li:my-0"
                dangerouslySetInnerHTML={{ __html: exp.details }}
                style={{ fontSize: `${baseFontSize}px`, lineHeight }}
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Education section
// ---------------------------------------------------------------------------
function EducationSection({
  education,
  globalSettings,
  title,
}: {
  education: Education[];
  globalSettings: GlobalSettings;
  title: string;
}) {
  const visible = education.filter((e) => e.visible !== false);
  if (!visible.length) return null;
  const { themeColor = "#18181b", baseFontSize = 14, subheaderSize = 15, sectionSpacing = 24, paragraphSpacing = 8, lineHeight = 1.6, headerSize = 16 } = globalSettings;

  return (
    <div style={{ marginTop: `${sectionSpacing}px` }}>
      <SectionHeading title={title} themeColor={themeColor} headerSize={headerSize} />
      <AnimatePresence mode="popLayout">
        {visible.map((edu) => (
          <motion.div key={edu.id} layout="position" style={{ marginBottom: `${paragraphSpacing * 2}px` }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="font-bold" style={{ fontSize: `${subheaderSize}px` }}>{edu.school}</span>
                {(edu.degree || edu.major) && (
                  <div className="text-gray-600" style={{ fontSize: `${baseFontSize}px` }}>
                    {[edu.degree, edu.major].filter(Boolean).join(" · ")}
                    {edu.gpa && ` · GPA ${edu.gpa}`}
                  </div>
                )}
              </div>
              <span className="text-gray-500 shrink-0 text-right text-sm">
                {edu.startDate && edu.endDate ? `${edu.startDate} – ${edu.endDate}` : edu.date || ""}
              </span>
            </div>
            {edu.description && (
              <div
                className="mt-1 prose prose-sm max-w-none prose-p:my-0.5"
                dangerouslySetInnerHTML={{ __html: edu.description }}
                style={{ fontSize: `${baseFontSize - 1}px`, lineHeight }}
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skills section
// ---------------------------------------------------------------------------
function SkillsSection({
  skillContent,
  skills,
  globalSettings,
  title,
}: {
  skillContent: string;
  skills: Skill[];
  globalSettings: GlobalSettings;
  title: string;
}) {
  const { themeColor = "#18181b", baseFontSize = 14, sectionSpacing = 24, lineHeight = 1.6, headerSize = 16 } = globalSettings;
  const hasContent = skillContent && skillContent !== "<p></p>";
  const hasSkills = skills.length > 0;
  if (!hasContent && !hasSkills) return null;

  return (
    <div style={{ marginTop: `${sectionSpacing}px` }}>
      <SectionHeading title={title} themeColor={themeColor} headerSize={headerSize} />
      {hasContent ? (
        <div
          className="prose prose-sm max-w-none prose-p:my-0.5 prose-ul:my-1 prose-li:my-0"
          dangerouslySetInnerHTML={{ __html: skillContent }}
          style={{ fontSize: `${baseFontSize}px`, lineHeight }}
        />
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills.map((s) => (
            <span key={s.id} className="px-2 py-0.5 rounded bg-gray-100 text-gray-700" style={{ fontSize: `${baseFontSize - 1}px` }}>
              {s.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Projects section
// ---------------------------------------------------------------------------
function ProjectsSection({
  projects,
  globalSettings,
  title,
}: {
  projects: Project[];
  globalSettings: GlobalSettings;
  title: string;
}) {
  const visible = projects.filter((p) => p.visible !== false);
  if (!visible.length) return null;
  const { themeColor = "#18181b", baseFontSize = 14, subheaderSize = 15, sectionSpacing = 24, paragraphSpacing = 8, lineHeight = 1.6, headerSize = 16 } = globalSettings;

  return (
    <div style={{ marginTop: `${sectionSpacing}px` }}>
      <SectionHeading title={title} themeColor={themeColor} headerSize={headerSize} />
      <AnimatePresence mode="popLayout">
        {visible.map((proj) => (
          <motion.div key={proj.id} layout="position" style={{ marginBottom: `${paragraphSpacing * 2}px` }}>
            <div className="flex items-center justify-between gap-4">
              <span className="font-bold truncate" style={{ fontSize: `${subheaderSize}px` }}>{proj.name}</span>
              {proj.date && <span className="text-gray-500 shrink-0 text-right" style={{ fontSize: `${subheaderSize - 1}px` }}>{proj.date}</span>}
            </div>
            {proj.role && <div className="text-gray-600 italic" style={{ fontSize: `${subheaderSize - 1}px` }}>{proj.role}</div>}
            {proj.link && <div className="text-blue-500 text-xs mt-0.5">{proj.link}</div>}
            {proj.description && (
              <div
                className="mt-1 prose prose-sm max-w-none prose-p:my-0.5 prose-ul:my-1 prose-li:my-0"
                dangerouslySetInnerHTML={{ __html: proj.description }}
                style={{ fontSize: `${baseFontSize}px`, lineHeight }}
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Custom section
// ---------------------------------------------------------------------------
function CustomSection({
  items,
  globalSettings,
  title,
}: {
  items: CustomItem[];
  globalSettings: GlobalSettings;
  title: string;
}) {
  const visible = items.filter((i) => i.visible !== false);
  if (!visible.length) return null;
  const { themeColor = "#18181b", baseFontSize = 14, subheaderSize = 15, sectionSpacing = 24, paragraphSpacing = 8, lineHeight = 1.6, headerSize = 16 } = globalSettings;

  return (
    <div style={{ marginTop: `${sectionSpacing}px` }}>
      <SectionHeading title={title} themeColor={themeColor} headerSize={headerSize} />
      <AnimatePresence mode="popLayout">
        {visible.map((item) => (
          <motion.div key={item.id} layout="position" style={{ marginBottom: `${paragraphSpacing * 2}px` }}>
            <div className="flex items-center justify-between gap-4">
              <span className="font-bold truncate" style={{ fontSize: `${subheaderSize}px` }}>{item.title}</span>
              {item.dateRange && <span className="text-gray-500 shrink-0 text-right" style={{ fontSize: `${subheaderSize - 1}px` }}>{item.dateRange}</span>}
            </div>
            {item.subtitle && <div className="text-gray-600" style={{ fontSize: `${baseFontSize}px` }}>{item.subtitle}</div>}
            {item.description && (
              <div
                className="mt-1 prose prose-sm max-w-none prose-p:my-0.5"
                dangerouslySetInnerHTML={{ __html: item.description }}
                style={{ fontSize: `${baseFontSize}px`, lineHeight }}
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main template
// ---------------------------------------------------------------------------
export function CreativeTemplate() {
  const { activeResume } = useResumeStore();
  if (!activeResume) return null;

  const { basic, experience, education, skills, skillContent, summaryContent = "", projects = [], customData = {}, globalSettings = {}, menuSections = [] } = activeResume;
  const gs = globalSettings;
  const themeColor = gs.themeColor || "#18181b";
  const baseFontSize = gs.baseFontSize || 14;
  const pagePadding = gs.pagePadding || 0;
  const fontFamily = gs.fontFamily || "Inter, sans-serif";

  const enabledSections = menuSections.filter((s) => s.enabled).sort((a, b) => a.order - b.order);

  return (
    <div
      className="w-full bg-white min-h-[1100px] shadow-xl text-gray-800"
      style={{ fontFamily, fontSize: `${baseFontSize}px` }}
    >
      {/* Colored header block */}
      <BasicInfoSection basic={basic} themeColor={themeColor} baseFontSize={baseFontSize} />

      {/* Content sections */}
      <div style={{ padding: `${pagePadding || 32}px` }}>
        {enabledSections
          .filter((s) => s.id !== "basic")
          .map((section) => {
            switch (section.id) {
              case "experience":
                return <ExperienceSection key={section.id} experiences={experience} globalSettings={gs} title={section.title} />;
              case "education":
                return <EducationSection key={section.id} education={education} globalSettings={gs} title={section.title} />;
              case "skills":
                return <SkillsSection key={section.id} skillContent={skillContent} skills={skills} globalSettings={gs} title={section.title} />;
              case "summary":
                if (!summaryContent) return null;
                return (
                  <div key={section.id} style={{ marginTop: gs.sectionSpacing || 24 }}>
                    <SectionHeading title={section.title} themeColor={themeColor} headerSize={gs.headerSize || 16} />
                    <div
                      className="prose prose-sm max-w-none text-gray-600 prose-p:my-0.5"
                      style={{ fontSize: `${baseFontSize}px` }}
                      dangerouslySetInnerHTML={{ __html: summaryContent }}
                    />
                  </div>
                );
              case "projects":
                return <ProjectsSection key={section.id} projects={projects} globalSettings={gs} title={section.title} />;
              default: {
                const items = customData[section.id] || [];
                if (items.length === 0) return null;
                return <CustomSection key={section.id} items={items} globalSettings={gs} title={section.title} />;
              }
            }
          })}
      </div>
    </div>
  );
}
