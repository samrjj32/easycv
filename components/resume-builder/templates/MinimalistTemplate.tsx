"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Icons from "lucide-react";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { BasicInfo, Education, Experience, GlobalSettings, Skill, Project, CustomItem } from "@/lib/types/resume";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getSectionTitle(menuSections: { id: string; title: string }[], id: string) {
  return menuSections.find((s) => s.id === id)?.title || id;
}

function getIcon(iconName: string | undefined) {
  if (!iconName) return null;
  const Comp = (Icons as unknown as Record<string, React.ElementType>)[iconName];
  return Comp ? <Comp className="w-3.5 h-3.5" /> : null;
}

// ---------------------------------------------------------------------------
// Section side-label heading (distinctive minimalist layout)
// ---------------------------------------------------------------------------
function SideLabel({ label, themeColor }: { label: string; themeColor: string }) {
  return (
    <div
      className="w-28 shrink-0 text-[10px] font-black uppercase tracking-[0.2em] pt-1"
      style={{ color: themeColor, opacity: 0.6 }}
    >
      {label}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Basic Info Header
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
    <header className={`mb-16 ${alignClass}`}>
      {/* Photo */}
      {basic.photo && basic.photoConfig?.visible && (
        <div
          className={`overflow-hidden mb-4 ${layout === "center" ? "mx-auto" : layout === "right" ? "ml-auto" : ""}`}
          style={{
            width: `${basic.photoConfig.width || 80}px`,
            height: `${basic.photoConfig.height || 80}px`,
            borderRadius:
              basic.photoConfig.borderRadius === "full"
                ? "9999px"
                : basic.photoConfig.borderRadius === "medium"
                ? "8px"
                : "0",
          }}
        >
          <img src={basic.photo} alt={basic.name} className="w-full h-full object-cover" />
        </div>
      )}
      <h1 className="text-5xl font-extralight tracking-tighter leading-none mb-3" style={{ color: themeColor }}>
        {basic.name?.split(" ").map((part, i) => (
          <span key={i} className={i >= 1 ? "font-black" : ""}>{part} </span>
        )) || "YOUR NAME"}
      </h1>
      <div className={`flex items-center gap-4 text-xs font-medium tracking-[0.15em] uppercase text-slate-400 ${flexJustify}`}>
        {basic.title && <span style={{ color: themeColor }}>{basic.title}</span>}
        {basic.location && (
          <>
            <span>•</span>
            <span>{basic.location}</span>
          </>
        )}
      </div>
      {allFields.length > 0 && (
        <div className={`mt-6 flex flex-wrap gap-x-8 gap-y-1 text-xs font-mono text-slate-400 ${flexJustify}`}>
          {allFields.map((item) => (
            <div key={item.key} className="flex items-center gap-1.5 tracking-tight">
              {getIcon(item.icon)}
              <span>{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </header>
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
  const { themeColor = "#171717", baseFontSize = 14, subheaderSize = 15, paragraphSpacing = 8, lineHeight = 1.6 } = globalSettings;

  return (
    <div className="flex gap-12">
      <SideLabel label={title} themeColor={themeColor} />
      <div className="flex-1 space-y-8">
        <AnimatePresence mode="popLayout">
          {visible.map((exp) => (
            <motion.div key={exp.id} layout="position">
              <div className="flex justify-between items-baseline mb-1">
                <span className="font-bold text-slate-900" style={{ fontSize: `${subheaderSize}px` }}>
                  {exp.position || exp.company}
                </span>
                <span className="text-xs font-mono text-slate-400">{exp.date}</span>
              </div>
              {exp.position && exp.company && (
                <div className="text-sm font-medium text-slate-500 mb-3 tracking-tight">{exp.company}</div>
              )}
              {exp.details && (
                <div
                  className="prose prose-sm max-w-none text-slate-600 leading-relaxed prose-p:my-0.5 prose-ul:my-1 prose-li:my-0"
                  dangerouslySetInnerHTML={{ __html: exp.details }}
                  style={{ fontSize: `${baseFontSize}px`, lineHeight }}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
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
  const { themeColor = "#171717", baseFontSize = 14, subheaderSize = 15 } = globalSettings;

  return (
    <div className="flex gap-12">
      <SideLabel label={title} themeColor={themeColor} />
      <div className="flex-1 space-y-5">
        <AnimatePresence mode="popLayout">
          {visible.map((edu) => (
            <motion.div key={edu.id} layout="position">
              <div className="flex justify-between items-baseline">
                <div>
                  <span className="font-bold text-slate-900 tracking-tight" style={{ fontSize: `${subheaderSize}px` }}>
                    {edu.school}
                  </span>
                  {(edu.degree || edu.major) && (
                    <div className="text-xs text-slate-500 italic mt-0.5">
                      {[edu.degree, edu.major].filter(Boolean).join(" · ")}
                      {edu.gpa && ` · GPA ${edu.gpa}`}
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {edu.startDate && edu.endDate ? `${edu.startDate} – ${edu.endDate}` : edu.date || ""}
                </span>
              </div>
              {edu.description && (
                <div
                  className="mt-1 prose prose-sm max-w-none text-slate-600 prose-p:my-0.5"
                  dangerouslySetInnerHTML={{ __html: edu.description }}
                  style={{ fontSize: `${baseFontSize - 1}px` }}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
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
  const { themeColor = "#171717", baseFontSize = 14, lineHeight = 1.6 } = globalSettings;
  const hasContent = skillContent && skillContent !== "<p></p>";
  const hasSkills = skills.length > 0;
  if (!hasContent && !hasSkills) return null;

  return (
    <div className="flex gap-12">
      <SideLabel label={title} themeColor={themeColor} />
      <div className="flex-1">
        {hasContent ? (
          <div
            className="prose prose-sm max-w-none text-slate-600 prose-p:my-0.5 prose-ul:my-1 prose-li:my-0"
            dangerouslySetInnerHTML={{ __html: skillContent }}
            style={{ fontSize: `${baseFontSize}px`, lineHeight }}
          />
        ) : (
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {skills.map((skill) => (
              <div key={skill.id} className="flex flex-col gap-1">
                <span className="text-sm font-bold text-slate-800 tracking-tight">{skill.name}</span>
                <div className="w-12 h-1 bg-slate-100 overflow-hidden rounded-full">
                  <div
                    className="h-full transition-all duration-1000 rounded-full"
                    style={{ width: `${(skill.level || 3) * 20}%`, backgroundColor: themeColor }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
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
  const { themeColor = "#171717", baseFontSize = 14, subheaderSize = 15, lineHeight = 1.6 } = globalSettings;

  return (
    <div className="flex gap-12">
      <SideLabel label={title} themeColor={themeColor} />
      <div className="flex-1 space-y-6">
        <AnimatePresence mode="popLayout">
          {visible.map((proj) => (
            <motion.div key={proj.id} layout="position">
              <div className="flex justify-between items-baseline mb-1">
                <span className="font-bold text-slate-900" style={{ fontSize: `${subheaderSize}px` }}>
                  {proj.name}
                </span>
                {proj.date && <span className="text-xs font-mono text-slate-400">{proj.date}</span>}
              </div>
              {proj.role && (
                <div className="text-sm font-medium text-slate-500 tracking-tight">{proj.role}</div>
              )}
              {proj.link && (
                <div className="text-xs text-blue-500 mt-0.5">{proj.link}</div>
              )}
              {proj.description && (
                <div
                  className="mt-1 prose prose-sm max-w-none text-slate-600 prose-p:my-0.5 prose-ul:my-1 prose-li:my-0"
                  dangerouslySetInnerHTML={{ __html: proj.description }}
                  style={{ fontSize: `${baseFontSize}px`, lineHeight }}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
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
  const { themeColor = "#171717", baseFontSize = 14, subheaderSize = 15, lineHeight = 1.6 } = globalSettings;

  return (
    <div className="flex gap-12">
      <SideLabel label={title} themeColor={themeColor} />
      <div className="flex-1 space-y-5">
        <AnimatePresence mode="popLayout">
          {visible.map((item) => (
            <motion.div key={item.id} layout="position">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-slate-900" style={{ fontSize: `${subheaderSize}px` }}>
                  {item.title}
                </span>
                {item.dateRange && (
                  <span className="text-xs font-mono text-slate-400">{item.dateRange}</span>
                )}
              </div>
              {item.subtitle && (
                <div className="text-sm text-slate-500">{item.subtitle}</div>
              )}
              {item.description && (
                <div
                  className="mt-1 prose prose-sm max-w-none text-slate-600 prose-p:my-0.5"
                  dangerouslySetInnerHTML={{ __html: item.description }}
                  style={{ fontSize: `${baseFontSize}px`, lineHeight }}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main template
// ---------------------------------------------------------------------------
export function MinimalistTemplate() {
  const { activeResume } = useResumeStore();
  if (!activeResume) return null;

  const { basic, experience, education, skills, skillContent, summaryContent = "", projects = [], customData = {}, globalSettings = {}, menuSections = [] } = activeResume;
  const gs = globalSettings;
  const themeColor = gs.themeColor || "#171717";
  const baseFontSize = gs.baseFontSize || 14;
  const pagePadding = gs.pagePadding || 64;
  const fontFamily = gs.fontFamily || "Inter, sans-serif";
  const sectionSpacing = gs.sectionSpacing || 40;

  const enabledSections = menuSections.filter((s) => s.enabled).sort((a, b) => a.order - b.order);

  return (
    <div
      className="w-full bg-white min-h-[1100px] shadow-xl text-slate-700 leading-relaxed"
      style={{ fontFamily, padding: `${pagePadding}px`, fontSize: `${baseFontSize}px` }}
    >
      <BasicInfoSection basic={basic} themeColor={themeColor} baseFontSize={baseFontSize} />

      <div style={{ display: "flex", flexDirection: "column", gap: `${sectionSpacing}px` }}>
        {enabledSections
          .filter((s) => s.id !== "basic")
          .map((section) => {
            switch (section.id) {
              case "experience":
                return (
                  <ExperienceSection
                    key={section.id}
                    experiences={experience}
                    globalSettings={gs}
                    title={section.title}
                  />
                );
              case "education":
                return (
                  <EducationSection
                    key={section.id}
                    education={education}
                    globalSettings={gs}
                    title={section.title}
                  />
                );
              case "skills":
                return (
                  <SkillsSection
                    key={section.id}
                    skillContent={skillContent}
                    skills={skills}
                    globalSettings={gs}
                    title={section.title}
                  />
                );
              case "summary":
                if (!summaryContent) return null;
                return (
                  <div key={section.id} className="flex gap-8" style={{ marginTop: gs.sectionSpacing || 24 }}>
                    <SideLabel label={section.title} themeColor={themeColor} />
                    <div
                      className="flex-1 prose prose-sm max-w-none text-gray-600 prose-p:my-0.5"
                      style={{ fontSize: `${baseFontSize}px` }}
                      dangerouslySetInnerHTML={{ __html: summaryContent }}
                    />
                  </div>
                );
              case "projects":
                return (
                  <ProjectsSection
                    key={section.id}
                    projects={projects}
                    globalSettings={gs}
                    title={section.title}
                  />
                );
              default: {
                const items = customData[section.id] || [];
                if (items.length === 0) return null;
                return (
                  <CustomSection
                    key={section.id}
                    items={items}
                    globalSettings={gs}
                    title={section.title}
                  />
                );
              }
            }
          })}
      </div>

      <div className="mt-20 text-[10px] text-slate-300 font-mono tracking-tighter">
        / {basic.name?.replace(/\s+/g, "-").toLowerCase()} / generated-v1.0
      </div>
    </div>
  );
}
