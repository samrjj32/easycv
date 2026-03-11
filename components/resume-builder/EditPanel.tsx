"use client";

import React from "react";
import { Pencil } from "lucide-react";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { BasicInfoEditor } from "./BasicInfoEditor";
import { ExperienceEditor } from "./ExperienceEditor";
import { EducationEditor } from "./EducationEditor";
import { SkillsEditor } from "./SkillsEditor";
import { ProjectsEditor } from "./ProjectsEditor";
import { SummaryEditor } from "./SummaryEditor";
import { CustomEditor } from "./CustomEditor";

export function EditPanel() {
  const { activeResume, updateResume } = useResumeStore();

  if (!activeResume) return null;

  const { activeSection = "basic", menuSections = [] } = activeResume;
  const currentSection = menuSections.find((s) => s.id === activeSection);

  const handleTitleChange = (newTitle: string) => {
    updateResume(activeResume.id, {
      menuSections: menuSections.map((s) =>
        s.id === activeSection ? { ...s, title: newTitle } : s
      ),
    });
  };

  const renderEditor = () => {
    switch (activeSection) {
      case "basic":      return <BasicInfoEditor />;
      case "summary":    return <SummaryEditor />;
      case "experience": return <ExperienceEditor />;
      case "education":  return <EducationEditor />;
      case "skills":     return <SkillsEditor />;
      case "projects":   return <ProjectsEditor />;
      default:           return <CustomEditor sectionId={activeSection} />;
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white">
      {/* Panel header */}
      <div className="px-5 py-3.5 border-b bg-gray-50/50 shrink-0 flex items-center gap-2.5">
        <span className="text-xl leading-none">{currentSection?.icon}</span>
        <div className="flex-1 min-w-0">
          {activeSection === "basic" ? (
            <>
              <h2 className="text-sm font-bold text-gray-900 leading-tight">
                {currentSection?.title || "Profile"}
              </h2>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Editing Module</p>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={currentSection?.title || ""}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="text-sm font-bold text-gray-900 leading-tight bg-transparent border-none outline-none w-full hover:bg-gray-100 focus:bg-gray-100 px-1.5 py-0.5 -ml-1.5 rounded transition-colors"
                placeholder="Section Name"
              />
              <Pencil className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            </div>
          )}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-5 scrollbar-hide">
        {renderEditor()}
      </div>
    </div>
  );
}
