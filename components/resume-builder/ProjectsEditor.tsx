"use client";

import React, { useState, useCallback } from "react";
import { PlusCircle, GripVertical, Trash2, Eye, EyeOff, ChevronDown, FolderKanban } from "lucide-react";
import { Reorder, AnimatePresence, motion, useDragControls } from "framer-motion";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { Project } from "@/lib/types/resume";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Field from "./Field";

function ProjectItem({ project }: { project: Project }) {
  const controls = useDragControls();
  const { updateProject, removeProject } = useResumeStore();
  const [expanded, setExpanded] = useState(false);

  const handleSave = (field: keyof Project, value: string) => {
    updateProject(project.id, { [field]: value } as Partial<Project>);
  };

  const handleVisibility = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    updateProject(project.id, { visible: !project.visible });
  }, [project.id, project.visible, updateProject]);

  return (
    <Reorder.Item
      value={project}
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
            expanded ? "cursor-not-allowed opacity-40" : "cursor-grab hover:bg-gray-50"
          )}
        >
          <GripVertical className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
        </div>

        <div className="flex-1 min-w-0">
          {/* Collapsed header */}
          <div
            className={cn("px-3 py-3 flex items-center gap-2 cursor-pointer select-none", expanded && "bg-gray-50/50")}
            onClick={() => setExpanded(!expanded)}
          >
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-semibold text-gray-800 truncate">{project.name || "Untitled Project"}</h3>
              {project.role && <p className="text-[11px] text-gray-400 truncate">{project.role}</p>}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={handleVisibility} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                {project.visible !== false ? <Eye className="w-3.5 h-3.5 text-blue-500" /> : <EyeOff className="w-3.5 h-3.5 text-gray-300" />}
              </button>
              <button onClick={(e) => { e.stopPropagation(); removeProject(project.id); }} className="p-1 rounded-lg hover:bg-red-50 transition-colors">
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
              </button>
              <motion.div initial={false} animate={{ rotate: expanded ? 180 : 0 }}>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </motion.div>
            </div>
          </div>

          {/* Expanded editor */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-3 pb-3 space-y-3 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                  <div className="pt-3 grid grid-cols-2 gap-3">
                    <Field label="Project Name" value={project.name || ""} onChange={(v) => handleSave("name", v)} placeholder="e.g. E-commerce App" />
                    <Field label="Role" value={project.role || ""} onChange={(v) => handleSave("role", v)} placeholder="e.g. Lead Developer" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Link" value={project.link || ""} onChange={(v) => handleSave("link", v)} placeholder="https://..." />
                    <Field label="Date" value={project.date || ""} onChange={(v) => handleSave("date", v)} placeholder="e.g. 2023-2024" />
                  </div>
                  <Field label="Description" value={project.description || ""} onChange={(v) => handleSave("description", v)} type="editor" placeholder="Describe the project..." />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Reorder.Item>
  );
}

export function ProjectsEditor() {
  const { activeResume, addProject, updateResume } = useResumeStore();
  if (!activeResume) return null;
  const { projects = [] } = activeResume;

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center gap-2">
        <span className="w-7 h-7 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
          <FolderKanban className="w-3.5 h-3.5" />
        </span>
        <h2 className="text-sm font-bold text-gray-900">Projects</h2>
      </div>

      <Reorder.Group
        axis="y"
        values={projects}
        onReorder={(newOrder) => updateResume(activeResume.id, { projects: newOrder })}
        className="space-y-2"
      >
        {projects.map((proj) => (
          <ProjectItem key={proj.id} project={proj} />
        ))}
      </Reorder.Group>

      <Button
        onClick={() => addProject({ name: "", role: "", date: "", description: "", link: "", visible: true, order: projects.length })}
        variant="outline"
        className="w-full h-10 border-dashed border-gray-200 text-gray-400 hover:border-purple-300 hover:text-purple-500 rounded-xl text-sm transition-all"
      >
        <PlusCircle className="w-4 h-4 mr-2" />
        Add Project
      </Button>
    </div>
  );
}
