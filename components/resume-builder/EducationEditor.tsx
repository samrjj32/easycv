"use client";

import React, { useState, useCallback } from "react";
import { PlusCircle, GripVertical, Trash2, Eye, EyeOff, ChevronDown, GraduationCap } from "lucide-react";
import { Reorder, AnimatePresence, motion, useDragControls } from "framer-motion";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { Education } from "@/lib/types/resume";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Field from "./Field";

function EducationItem({ edu }: { edu: Education }) {
  const controls = useDragControls();
  const { updateEducation, removeEducation } = useResumeStore();
  const [expanded, setExpanded] = useState(false);

  const handleVisibility = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    updateEducation(edu.id, { visible: !edu.visible });
  }, [edu.id, edu.visible, updateEducation]);

  return (
    <Reorder.Item
      value={edu}
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
          className={cn("w-8 flex items-center justify-center border-r border-gray-100 shrink-0 touch-none", expanded ? "cursor-not-allowed opacity-30" : "cursor-grab hover:bg-gray-50")}
        >
          <GripVertical className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-400 transition-colors" />
        </div>
        <div
          className="flex-1 flex items-center justify-between px-3 py-3 cursor-pointer select-none"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex-1 min-w-0">
            <h3 className={cn("text-sm font-medium truncate", !edu.school && "text-gray-400 italic")}>
              {edu.school || "New School"}
            </h3>
            {edu.degree && <p className="text-xs text-gray-400 truncate">{edu.degree}</p>}
          </div>
          <div className="flex items-center gap-1 ml-3 shrink-0">
            <button onClick={handleVisibility} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              {edu.visible !== false ? <Eye className="w-3.5 h-3.5 text-blue-500" /> : <EyeOff className="w-3.5 h-3.5 text-gray-300" />}
            </button>
            <button onClick={(e) => { e.stopPropagation(); removeEducation(edu.id); }} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
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
                <Field label="School" value={edu.school || ""} onChange={(v) => updateEducation(edu.id, { school: v })} placeholder="e.g. MIT" />
                <Field label="Degree" value={edu.degree || ""} onChange={(v) => updateEducation(edu.id, { degree: v })} placeholder="e.g. B.S. Computer Science" />
              </div>
              <Field label="Major" value={edu.major || ""} onChange={(v) => updateEducation(edu.id, { major: v })} placeholder="e.g. Computer Science" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Start Date" value={edu.startDate || ""} onChange={(v) => updateEducation(edu.id, { startDate: v })} placeholder="Sep 2018" />
                <Field label="End Date" value={edu.endDate || ""} onChange={(v) => updateEducation(edu.id, { endDate: v })} placeholder="May 2022" />
              </div>
              {edu.gpa && (
                <Field label="GPA" value={edu.gpa?.toString() || ""} onChange={(v) => updateEducation(edu.id, { gpa: v })} placeholder="e.g. 3.8/4.0" />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Reorder.Item>
  );
}

export function EducationEditor() {
  const { activeResume, addEducation, updateResume } = useResumeStore();

  if (!activeResume) return null;
  const { education = [] } = activeResume;

  const addNew = () => {
    addEducation({ school: "", major: "", degree: "", startDate: "", endDate: "", visible: true, order: education.length });
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-7 h-7 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
          <GraduationCap className="w-3.5 h-3.5" />
        </span>
        <h2 className="text-sm font-bold text-gray-900">Education</h2>
      </div>
      <Reorder.Group axis="y" values={education} onReorder={(newOrder) => updateResume(activeResume.id, { education: newOrder })} className="space-y-2">
        <AnimatePresence mode="popLayout">
          {education.map((item) => <EducationItem key={item.id} edu={item} />)}
        </AnimatePresence>
      </Reorder.Group>
      <Button onClick={addNew} variant="outline" className="w-full h-10 border-dashed border-gray-200 text-gray-400 hover:border-purple-300 hover:text-purple-500 hover:bg-purple-50/50 rounded-xl text-sm transition-all">
        <PlusCircle className="w-4 h-4 mr-2" />Add Education
      </Button>
    </div>
  );
}
