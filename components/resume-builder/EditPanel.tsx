"use client";

import React from "react";
import { Pencil, ChevronLeft, X } from "lucide-react";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { BasicInfoEditor } from "./BasicInfoEditor";
import { ExperienceEditor } from "./ExperienceEditor";
import { EducationEditor } from "./EducationEditor";
import { SkillsEditor } from "./SkillsEditor";
import { ProjectsEditor } from "./ProjectsEditor";
import { SummaryEditor } from "./SummaryEditor";
import { CustomEditor } from "./CustomEditor";

export function EditPanel() {
  const { activeResume, updateResume, setMobileEditorView, setActiveSection } = useResumeStore();

  if (!activeResume) return null;

  const { activeSection = "", menuSections = [] } = activeResume;
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
      case "":           return null;
      default:           return <CustomEditor sectionId={activeSection} />;
    }
  };

  if (!activeSection) {
    return <div className="h-full bg-white" />;
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white">
      {/* Panel header */}
      <div className="px-3 sm:px-5 py-5 border-b border-gray-100 bg-white shrink-0 flex items-start gap-3">
        <button
          onClick={() => setMobileEditorView("menu")}
          className="lg:hidden p-1.5 -ml-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors mt-0.5"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
          <span className="text-lg leading-none">{currentSection?.icon}</span>
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center h-10">
          {activeSection === "basic" ? (
            <>
              <h2 className="text-base font-bold text-gray-900 leading-tight">
                {currentSection?.title || "Profile"}
              </h2>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5 font-medium">Editing Module</p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 group">
                <input
                  type="text"
                  value={currentSection?.title || ""}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="text-base font-bold text-gray-900 leading-tight bg-transparent border-none outline-none w-full hover:bg-gray-50 focus:bg-gray-50 px-1.5 py-0.5 -ml-1.5 rounded transition-colors"
                  placeholder="Section Name"
                />
                <Pencil className="w-3.5 h-3.5 text-transparent group-hover:text-gray-400 shrink-0 transition-colors" />
              </div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest px-0.5 font-medium max-w-full truncate">Editing Module</p>
            </>
          )}
        </div>
        <button
          onClick={() => {
            setMobileEditorView("menu");
            setActiveSection("");
          }}
          className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors mt-0.5"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-5 scrollbar-hide">
        {renderEditor()}
      </div>
    </div>
  );
}
