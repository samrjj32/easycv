"use client";

import React from "react";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { AnimatePresence, motion, Reorder, useDragControls } from "framer-motion";
import { Eye, EyeOff, GripVertical, Trash2, Plus, Palette, Type, Space } from "lucide-react";
import { cn } from "@/lib/utils";
import { MenuSection } from "@/lib/types/resume";

const THEME_COLORS = [
  "#000000", "#1A1A1A", "#333333", "#4D4D4D",
  "#666666", "#808080", "#999999", "#0047AB",
  "#8B0000", "#FF4500", "#4B0082", "#2E8B57",
];

// ------ Single draggable module row ------
function ModuleItem({
  item,
  isActive,
  isBasic,
  onSelect,
  onToggle,
  onDelete,
}: {
  item: MenuSection;
  isActive: boolean;
  isBasic?: boolean;
  onSelect: () => void;
  onToggle: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
}) {
  const controls = useDragControls();

  if (isBasic) {
    return (
      <div
        onClick={onSelect}
        className={cn(
          "flex items-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer transition-all select-none",
          isActive
            ? "bg-black border-black text-white"
            : "bg-white border-gray-100 hover:border-gray-300 text-gray-700"
        )}
      >
        <span className="text-base w-5 text-center shrink-0">{item.icon}</span>
        <span className="text-xs font-medium flex-1 truncate">{item.title}</span>
        <button
          onClick={onToggle}
          className={cn(
            "p-1 rounded transition-colors shrink-0",
            isActive ? "hover:bg-white/10" : "hover:bg-gray-100"
          )}
        >
          {item.enabled !== false
            ? <Eye className={cn("w-3.5 h-3.5", isActive ? "text-white/70" : "text-blue-500")} />
            : <EyeOff className={cn("w-3.5 h-3.5", isActive ? "text-white/50" : "text-gray-400")} />}
        </button>
      </div>
    );
  }

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      className={cn(
        "flex items-center rounded-lg border cursor-pointer transition-all select-none overflow-hidden group",
        isActive
          ? "bg-black border-black text-white"
          : "bg-white border-gray-100 hover:border-gray-300 text-gray-700"
      )}
    >
      <div
        onPointerDown={(e) => controls.start(e)}
        className={cn(
          "w-7 flex items-center justify-center py-2.5 shrink-0 touch-none cursor-grab",
          isActive ? "hover:bg-white/10" : "hover:bg-gray-100"
        )}
      >
        <GripVertical className={cn("w-3.5 h-3.5", isActive ? "text-white/50" : "text-gray-300 group-hover:text-gray-500")} />
      </div>
      <div
        className="flex items-center gap-2 flex-1 px-1.5 py-2.5 min-w-0"
        onClick={onSelect}
      >
        <span className="text-base w-5 text-center shrink-0">{item.icon}</span>
        <span className="text-xs font-medium flex-1 truncate">{item.title}</span>
        <button
          onClick={onToggle}
          className={cn(
            "p-1 rounded transition-colors shrink-0",
            isActive ? "hover:bg-white/10" : "hover:bg-gray-100"
          )}
        >
          {item.enabled !== false
            ? <Eye className={cn("w-3.5 h-3.5", isActive ? "text-white/70" : "text-blue-500")} />
            : <EyeOff className={cn("w-3.5 h-3.5", isActive ? "text-white/50" : "text-gray-400")} />}
        </button>
        {onDelete && (
          <button
            onClick={onDelete}
            className={cn(
              "p-1 rounded transition-colors shrink-0",
              isActive ? "hover:bg-white/10" : "hover:bg-red-50"
            )}
          >
            <Trash2 className={cn("w-3 h-3", isActive ? "text-white/50" : "text-red-400")} />
          </button>
        )}
      </div>
    </Reorder.Item>
  );
}

export function SidePanel() {
  const {
    activeResumeId,
    activeResume,
    updateResume,
    setActiveSection,
    setMobileEditorView,
    toggleSectionVisibility,
    setThemeColor,
    updateGlobalSettings,
  } = useResumeStore();

  if (!activeResume) return null;

  const { menuSections = [], activeSection = "basic", globalSettings = {} } = activeResume;
  const {
    themeColor = "#000000",
    baseFontSize = 14,
    pagePadding = 40,
    lineHeight = 1.5,
    sectionSpacing = 24,
    paragraphSpacing = 12,
    headerSize = 18,
    subheaderSize = 14,
  } = globalSettings;

  // Handle reorder
  const handleReorder = (newOrder: MenuSection[]) => {
    if (!activeResumeId) return;
    updateResume(activeResumeId, { menuSections: newOrder });
  };

  const handleSelect = (id: string) => {
    setActiveSection(id);
    setMobileEditorView("form");
  };

  const basicSection = menuSections.find((s) => s.id === "basic");
  const draggableSections = menuSections.filter((s) => s.id !== "basic");

  const addCustomSection = () => {
    const customSections = menuSections.filter((s) => s.id.startsWith("custom"));
    const nextNum = customSections.length + 1;
    const id = `custom-${nextNum}`;
    updateResume(activeResume.id, {
      menuSections: [
        ...menuSections,
        { id, title: `Custom ${nextNum}`, icon: "📝", enabled: true, order: menuSections.length },
      ],
    });
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto scrollbar-hide">
      {/* Module List */}
      <div className="p-3 space-y-1.5">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 mb-2">Layout</p>

        {basicSection && (
          <ModuleItem
            item={basicSection}
            isActive={activeSection === basicSection.id}
            isBasic
            onSelect={() => handleSelect(basicSection.id)}
            onToggle={(e) => { e.stopPropagation(); toggleSectionVisibility(basicSection.id); }}
          />
        )}

        <Reorder.Group
          axis="y"
          values={draggableSections}
          onReorder={(newOrder) => {
            handleReorder([
              ...menuSections.filter((s) => s.id === "basic"),
              ...newOrder,
            ]);
          }}
          className="space-y-1.5"
        >
          <AnimatePresence>
            {draggableSections.map((item) => (
              <ModuleItem
                key={item.id}
                item={item}
                isActive={activeSection === item.id}
                onSelect={() => handleSelect(item.id)}
                onToggle={(e) => { e.stopPropagation(); toggleSectionVisibility(item.id); }}
                onDelete={item.id.startsWith("custom") ? (e) => {
                  e.stopPropagation();
                  updateResume(activeResume.id, {
                    menuSections: menuSections.filter((s) => s.id !== item.id),
                  });
                } : undefined}
              />
            ))}
          </AnimatePresence>
        </Reorder.Group>

        <button
          onClick={addCustomSection}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-gray-400 border border-dashed border-gray-200 rounded-lg hover:border-gray-300 hover:text-gray-600 transition-colors mt-2"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Module
        </button>
      </div>

      {/* ──── Theme Color ──── */}
      <div className="px-3 pb-3 pt-1">
        <div className="border border-gray-100 rounded-xl bg-white p-3 space-y-3">
          <div className="flex items-center gap-2">
            <Palette className="w-3.5 h-3.5 text-gray-400" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Theme Color</p>
          </div>
          <div className="grid grid-cols-6 gap-1.5">
            {THEME_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setThemeColor(c)}
                className={cn(
                  "w-full aspect-square rounded-md border-2 transition-all hover:scale-110",
                  themeColor === c ? "border-gray-900 scale-110 shadow-sm" : "border-transparent"
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400">Custom</span>
            <input
              type="color"
              value={themeColor}
              onChange={(e) => setThemeColor(e.target.value)}
              className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent"
            />
            <span className="text-[10px] text-gray-500 font-mono">{themeColor}</span>
          </div>
        </div>
      </div>

      {/* ──── Typography ──── */}
      <div className="px-3 pb-3">
        <div className="border border-gray-100 rounded-xl bg-white p-3 space-y-3">
          <div className="flex items-center gap-2">
            <Type className="w-3.5 h-3.5 text-gray-400" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Typography</p>
          </div>

          {/* Base Font Size */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-[10px] text-gray-400 uppercase tracking-wide">Font Size</span>
              <span className="text-[10px] text-gray-500 font-mono">{baseFontSize}px</span>
            </div>
            <input
              type="range" min="12" max="20" step="1"
              value={baseFontSize}
              onChange={(e) => updateGlobalSettings({ baseFontSize: parseInt(e.target.value) })}
              className="w-full h-1 appearance-none rounded bg-gray-200 accent-black cursor-pointer"
            />
          </div>

          {/* Line Height */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-[10px] text-gray-400 uppercase tracking-wide">Line Height</span>
              <span className="text-[10px] text-gray-500 font-mono">{lineHeight}</span>
            </div>
            <input
              type="range" min="1" max="2" step="0.1"
              value={lineHeight}
              onChange={(e) => updateGlobalSettings({ lineHeight: parseFloat(e.target.value) })}
              className="w-full h-1 appearance-none rounded bg-gray-200 accent-black cursor-pointer"
            />
          </div>

          {/* Header Size */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-[10px] text-gray-400 uppercase tracking-wide">Header Size</span>
              <span className="text-[10px] text-gray-500 font-mono">{headerSize}px</span>
            </div>
            <select
              value={headerSize}
              onChange={(e) => updateGlobalSettings({ headerSize: parseInt(e.target.value) })}
              className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 outline-none focus:border-gray-400 transition-colors"
            >
              {[12, 13, 14, 15, 16, 18, 20, 24].map((s) => (
                <option key={s} value={s}>{s}px</option>
              ))}
            </select>
          </div>

          {/* Subheader Size */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-[10px] text-gray-400 uppercase tracking-wide">Subheader Size</span>
              <span className="text-[10px] text-gray-500 font-mono">{subheaderSize}px</span>
            </div>
            <select
              value={subheaderSize}
              onChange={(e) => updateGlobalSettings({ subheaderSize: parseInt(e.target.value) })}
              className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 outline-none focus:border-gray-400 transition-colors"
            >
              {[12, 13, 14, 15, 16, 18, 20, 24].map((s) => (
                <option key={s} value={s}>{s}px</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ──── Spacing ──── */}
      <div className="px-3 pb-4">
        <div className="border border-gray-100 rounded-xl bg-white p-3 space-y-3">
          <div className="flex items-center gap-2">
            <Space className="w-3.5 h-3.5 text-gray-400" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Spacing</p>
          </div>

          {/* Page Padding */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-[10px] text-gray-400 uppercase tracking-wide">Page Padding</span>
              <span className="text-[10px] text-gray-500 font-mono">{pagePadding}px</span>
            </div>
            <input
              type="range" min="20" max="80" step="2"
              value={pagePadding}
              onChange={(e) => updateGlobalSettings({ pagePadding: parseInt(e.target.value) })}
              className="w-full h-1 appearance-none rounded bg-gray-200 accent-black cursor-pointer"
            />
          </div>

          {/* Section Spacing */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-[10px] text-gray-400 uppercase tracking-wide">Section Spacing</span>
              <span className="text-[10px] text-gray-500 font-mono">{sectionSpacing}px</span>
            </div>
            <input
              type="range" min="4" max="60" step="2"
              value={sectionSpacing}
              onChange={(e) => updateGlobalSettings({ sectionSpacing: parseInt(e.target.value) })}
              className="w-full h-1 appearance-none rounded bg-gray-200 accent-black cursor-pointer"
            />
          </div>

          {/* Paragraph Spacing */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-[10px] text-gray-400 uppercase tracking-wide">Paragraph Spacing</span>
              <span className="text-[10px] text-gray-500 font-mono">{paragraphSpacing}px</span>
            </div>
            <input
              type="range" min="2" max="30" step="1"
              value={paragraphSpacing}
              onChange={(e) => updateGlobalSettings({ paragraphSpacing: parseInt(e.target.value) })}
              className="w-full h-1 appearance-none rounded bg-gray-200 accent-black cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
