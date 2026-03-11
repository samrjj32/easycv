"use client";

import React, { useState } from "react";
import { Zap, List, BarChart2 } from "lucide-react";
import { useResumeStore } from "@/lib/store/useResumeStore";
import Field from "./Field";
import { cn } from "@/lib/utils";

type Mode = "richtext" | "tags";

export function SkillsEditor() {
  const { activeResume, updateSkillContent, addSkill, updateSkill, removeSkill, updateResume } = useResumeStore();
  const [mode, setMode] = useState<Mode>("richtext");

  if (!activeResume) return null;
  const { skillContent = "", skills = [] } = activeResume;

  return (
    <div className="space-y-4 pb-20">
      {/* Header with mode toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
            <Zap className="w-3.5 h-3.5" />
          </span>
          <h2 className="text-sm font-bold text-gray-900">Skills</h2>
        </div>
        <div className="flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5">
          <button
            onClick={() => setMode("richtext")}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all",
              mode === "richtext" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <List className="w-3 h-3" />
            Rich Text
          </button>
          <button
            onClick={() => setMode("tags")}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all",
              mode === "tags" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <BarChart2 className="w-3 h-3" />
            Tags
          </button>
        </div>
      </div>

      {mode === "richtext" ? (
        <div className="space-y-2">
          <p className="text-xs text-gray-400">
            Write your skills as a rich text list — this content will render directly in the preview.
          </p>
          <Field
            value={skillContent || ""}
            onChange={updateSkillContent}
            type="editor"
            placeholder="e.g. Front-end: React, TypeScript, Tailwind CSS..."
          />
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-gray-400">Skill tags will render as badges in the preview.</p>
          {skills.map((skill) => (
            <div key={skill.id} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
              <input
                type="text"
                value={skill.name || ""}
                onChange={(e) => updateSkill(skill.id, { name: e.target.value })}
                placeholder="e.g. React"
                className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none"
              />
              <select
                value={skill.level ?? 1}
                onChange={(e) => updateSkill(skill.id, { level: parseInt(e.target.value) })}
                className="text-xs border border-gray-100 rounded-lg px-2 py-1 bg-white text-gray-600 focus:outline-none"
              >
                <option value={0}>Beginner</option>
                <option value={1}>Intermediate</option>
                <option value={2}>Advanced</option>
                <option value={3}>Expert</option>
              </select>
              <button
                onClick={() => removeSkill(skill.id)}
                className="p-1 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={() => addSkill({ name: "", level: 1, order: skills.length })}
            className="w-full h-9 border border-dashed border-gray-200 text-gray-400 hover:border-amber-300 hover:text-amber-500 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
          >
            + Add Skill
          </button>
        </div>
      )}
    </div>
  );
}
