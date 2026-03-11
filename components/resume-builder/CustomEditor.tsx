"use client";

import React, { useState, useCallback } from "react";
import { PlusCircle, GripVertical, Trash2, Eye, EyeOff, ChevronDown, LayoutGrid } from "lucide-react";
import { Reorder, AnimatePresence, motion, useDragControls } from "framer-motion";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { CustomItem } from "@/lib/types/resume";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Field from "./Field";

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

function CustomItemRow({ item, sectionId }: { item: CustomItem; sectionId: string }) {
  const controls = useDragControls();
  const { updateResume, activeResume } = useResumeStore();
  const [expanded, setExpanded] = useState(false);

  if (!activeResume) return null;
  const customData = activeResume.customData || {};
  const items = customData[sectionId] || [];

  const updateItem = (changes: Partial<CustomItem>) => {
    updateResume(activeResume.id, {
      customData: {
        ...customData,
        [sectionId]: items.map((i) => (i.id === item.id ? { ...i, ...changes } : i)),
      },
    });
  };

  const removeItem = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateResume(activeResume.id, {
      customData: {
        ...customData,
        [sectionId]: items.filter((i) => i.id !== item.id),
      },
    });
  };

  const handleVisibility = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    updateItem({ visible: !item.visible });
  }, [item.visible]);

  return (
    <Reorder.Item
      value={item}
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
              <h3 className="text-xs font-semibold text-gray-800 truncate">{item.title || "Untitled Item"}</h3>
              {item.subtitle && <p className="text-[11px] text-gray-400 truncate">{item.subtitle}</p>}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={handleVisibility} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                {item.visible !== false ? <Eye className="w-3.5 h-3.5 text-blue-500" /> : <EyeOff className="w-3.5 h-3.5 text-gray-300" />}
              </button>
              <button onClick={removeItem} className="p-1 rounded-lg hover:bg-red-50 transition-colors">
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
                    <Field label="Title" value={item.title || ""} onChange={(v) => updateItem({ title: v })} placeholder="Title" />
                    <Field label="Subtitle" value={item.subtitle || ""} onChange={(v) => updateItem({ subtitle: v })} placeholder="Subtitle" />
                  </div>
                  <Field label="Date Range" value={item.dateRange || ""} onChange={(v) => updateItem({ dateRange: v })} placeholder="e.g. 2023 - 2024" />
                  <Field label="Description" value={item.description || ""} onChange={(v) => updateItem({ description: v })} type="editor" placeholder="Describe this entry..." />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Reorder.Item>
  );
}

export function CustomEditor({ sectionId }: { sectionId: string }) {
  const { activeResume, updateResume } = useResumeStore();
  if (!activeResume) return null;
  const customData = activeResume.customData || {};
  const items: CustomItem[] = customData[sectionId] || [];

  const addItem = () => {
    const newItem: CustomItem = { id: generateId(), title: "", subtitle: "", dateRange: "", description: "", visible: true };
    updateResume(activeResume.id, {
      customData: { ...customData, [sectionId]: [...items, newItem] },
    });
  };

  const reorderItems = (newOrder: CustomItem[]) => {
    updateResume(activeResume.id, {
      customData: { ...customData, [sectionId]: newOrder },
    });
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center gap-2">
        <span className="w-7 h-7 bg-teal-50 text-teal-600 rounded-lg flex items-center justify-center">
          <LayoutGrid className="w-3.5 h-3.5" />
        </span>
        <h2 className="text-sm font-bold text-gray-900">Custom Section</h2>
      </div>

      <Reorder.Group
        axis="y"
        values={items}
        onReorder={reorderItems}
        className="space-y-2"
      >
        {items.map((item) => (
          <CustomItemRow key={item.id} item={item} sectionId={sectionId} />
        ))}
      </Reorder.Group>

      <Button
        onClick={addItem}
        variant="outline"
        className="w-full h-10 border-dashed border-gray-200 text-gray-400 hover:border-teal-300 hover:text-teal-500 rounded-xl text-sm transition-all"
      >
        <PlusCircle className="w-4 h-4 mr-2" />
        Add Item
      </Button>
    </div>
  );
}
