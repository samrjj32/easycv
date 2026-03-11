"use client";

import { useResumeStore } from "@/lib/store/useResumeStore";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reorder, AnimatePresence, useDragControls } from "framer-motion";

interface SectionItemProps {
  section: {
    id: string;
    title: string;
    icon: string;
    enabled: boolean;
    order: number;
  };
  isActive: boolean;
  onSelect: () => void;
  onToggleVisibility: (e: React.MouseEvent) => void;
}

function SectionItem({ section, isActive, onSelect, onToggleVisibility }: SectionItemProps) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      key={section.id}
      value={section}
      dragListener={false}
      dragControls={controls}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 35 }}
      onClick={onSelect}
      className={cn(
        "flex items-center gap-3 p-2.5 rounded-2xl border transition-all cursor-pointer group select-none",
        isActive
          ? "bg-black border-black shadow-sm"
          : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm"
      )}
    >
      {/* Drag Handle */}
      <div
        className="touch-none cursor-grab active:cursor-grabbing p-1 transition-colors"
        onPointerDown={(e) => controls.start(e)}
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical
          className={cn("w-4 h-4 transition-colors", isActive ? "text-white/40" : "text-gray-300 group-hover:text-gray-400")}
        />
      </div>

      {/* Icon */}
      <div className={cn(
        "flex items-center justify-center w-7 h-7 rounded-lg text-base transition-all",
        isActive ? "bg-white/10" : "bg-gray-50 group-hover:scale-110"
      )}>
        {section.icon}
      </div>

      {/* Title */}
      <div className="flex-1">
        <span className={cn(
          "font-semibold text-sm transition-colors",
          isActive ? "text-white" : "text-gray-800"
        )}>
          {section.title}
        </span>
      </div>

      {/* Visibility Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "w-7 h-7 rounded-lg transition-colors shrink-0",
          isActive
            ? "text-white/50 hover:text-white hover:bg-white/10"
            : section.enabled ? "text-gray-400 hover:bg-gray-50" : "text-gray-300 hover:bg-gray-50"
        )}
        onClick={onToggleVisibility}
      >
        {section.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
      </Button>
    </Reorder.Item>
  );
}

export function ModuleManagement() {
  const { activeResume, toggleSectionVisibility, reorderSections, setActiveSection } = useResumeStore();

  if (!activeResume) return null;

  const sections = [...activeResume.menuSections].sort((a, b) => a.order - b.order);
  const activeSectionId = activeResume.activeSection || "basic";

  const handleReorder = (newSections: typeof sections) => {
    const withOrder = newSections.map((s, i) => ({ ...s, order: i }));
    reorderSections(withOrder);
  };

  return (
    <div className="space-y-2">
      <Reorder.Group axis="y" values={sections} onReorder={handleReorder} className="space-y-2">
        <AnimatePresence mode="popLayout">
          {sections.map((section) => (
            <SectionItem
              key={section.id}
              section={section}
              isActive={section.id === activeSectionId}
              onSelect={() => setActiveSection(section.id)}
              onToggleVisibility={(e) => {
                e.stopPropagation();
                toggleSectionVisibility(section.id);
              }}
            />
          ))}
        </AnimatePresence>
      </Reorder.Group>
    </div>
  );
}
