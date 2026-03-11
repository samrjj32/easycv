"use client";

import React, { useState, useCallback } from "react";
import { PlusCircle, GripVertical, Trash2, Eye, EyeOff, ChevronDown, Briefcase } from "lucide-react";
import { Reorder, AnimatePresence, motion, useDragControls } from "framer-motion";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { Experience } from "@/lib/types/resume";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Field from "./Field";

function ExperienceItem({ experience }: { experience: Experience }) {
  const controls = useDragControls();
  const { updateExperience, removeExperience, activeResume, updateResume } = useResumeStore();
  const [expanded, setExpanded] = useState(false);

  const handleSave = (field: keyof Experience, value: string) => {
    updateExperience(experience.id, { [field]: value } as Partial<Experience>);
  };

  const handleVisibility = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    updateExperience(experience.id, { visible: !experience.visible });
  }, [experience.id, experience.visible, updateExperience]);

  return (
    <Reorder.Item
      value={experience}
      dragListener={false}
      dragControls={controls}
      className={cn(
        "rounded-xl border overflow-hidden group bg-white",
        expanded ? "border-gray-300 shadow-sm" : "border-gray-100 hover:border-gray-200"
      )}
    >
      <div className="flex items-stretch">
        <div
          onPointerDown={(e) => { if (!expanded) controls.start(e); }}
          className={cn(
            "w-8 flex items-center justify-center border-r border-gray-100 shrink-0 touch-none",
            expanded ? "cursor-not-allowed opacity-30" : "cursor-grab hover:bg-gray-50"
          )}
        >
          <GripVertical className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-400 transition-colors" />
        </div>
        <div
          className="flex-1 flex items-center justify-between px-3 py-3 cursor-pointer select-none"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex-1 min-w-0">
            <h3 className={cn("text-sm font-medium truncate", !experience.company && "text-gray-400 italic")}>
              {experience.company || "New Company"}
            </h3>
            {experience.position && <p className="text-xs text-gray-400 truncate">{experience.position}</p>}
          </div>
          <div className="flex items-center gap-1 ml-3 shrink-0">
            <button onClick={handleVisibility} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              {experience.visible !== false ? <Eye className="w-3.5 h-3.5 text-blue-500" /> : <EyeOff className="w-3.5 h-3.5 text-gray-300" />}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); removeExperience(experience.id); }}
              className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
            </button>
            <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </motion.div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 space-y-3 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Company" value={experience.company || ""} onChange={(v) => handleSave("company", v)} placeholder="e.g. Google" />
                <Field label="Position" value={experience.position || ""} onChange={(v) => handleSave("position", v)} placeholder="e.g. Software Engineer" />
              </div>
              <Field label="Dates" value={experience.date || ""} onChange={(v) => handleSave("date", v)} placeholder="e.g. Jan 2022 – Present" showPresentSwitch />
              <Field label="Details" value={experience.details || ""} onChange={(v) => handleSave("details", v)} type="editor" placeholder="Describe key accomplishments..." />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Reorder.Item>
  );
}

export function ExperienceEditor() {
  const { activeResume, addExperience, updateResume } = useResumeStore();

  if (!activeResume) return null;
  const { experience = [] } = activeResume;

  const addNew = () => {
    addExperience({ company: "", position: "", date: "", details: "", visible: true, order: experience.length });
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-7 h-7 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
          <Briefcase className="w-3.5 h-3.5" />
        </span>
        <h2 className="text-sm font-bold text-gray-900">Work Experience</h2>
      </div>
      <Reorder.Group axis="y" values={experience} onReorder={(newOrder) => updateResume(activeResume.id, { experience: newOrder })} className="space-y-2">
        <AnimatePresence mode="popLayout">
          {experience.map((item) => <ExperienceItem key={item.id} experience={item} />)}
        </AnimatePresence>
      </Reorder.Group>
      <Button onClick={addNew} variant="outline" className="w-full h-10 border-dashed border-gray-200 text-gray-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/50 rounded-xl text-sm transition-all">
        <PlusCircle className="w-4 h-4 mr-2" />Add Experience
      </Button>
    </div>
  );
}
