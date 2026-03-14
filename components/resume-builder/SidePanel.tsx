"use client";

import React from "react";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { AnimatePresence, motion, Reorder, useDragControls } from "framer-motion";
import { Eye, EyeOff, GripVertical, Trash2, Plus, Palette, Type, Space, ChevronDown, LayoutTemplate, MoveHorizontal, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { MenuSection } from "@/lib/types/resume";

const THEME_COLORS = [
  "#000000", "#1A1A1A", "#333333", "#4D4D4D",
  "#666666", "#808080", "#999999", "#0047AB",
  "#8B0000", "#FF4500", "#4B0082", "#2E8B57",
];

function CollapsibleSection({ 
  title, 
  icon, 
  children, 
  defaultOpen = true 
}: { 
  title: string, 
  icon: React.ReactNode, 
  children: React.ReactNode, 
  defaultOpen?: boolean 
}) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className="border border-gray-100 rounded-2xl bg-white overflow-hidden mb-4 shadow-sm">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="text-sm font-bold text-gray-900">{title}</span>
        </div>
        <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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
          "flex items-center gap-2 px-3 py-3 rounded-xl border cursor-pointer transition-all select-none",
          isActive
            ? "bg-black border-black text-white shadow-md"
            : "bg-white border-gray-200 hover:border-gray-300 text-gray-700 shadow-sm"
        )}
      >
        <div className="w-5 flex items-center justify-center shrink-0">
          <GripVertical className="w-4 h-4 text-transparent" /> {/* Invisible placeholder for alignment */}
        </div>
        <span className="text-base w-5 text-center shrink-0">{item.icon}</span>
        <span className="text-sm font-semibold flex-1 truncate">{item.title}</span>
        <button
          onClick={onToggle}
          className={cn(
            "p-1.5 rounded-lg transition-colors shrink-0",
            isActive ? "hover:bg-white/10" : "hover:bg-gray-100"
          )}
        >
          {item.enabled !== false
            ? <Eye className={cn("w-4 h-4", isActive ? "text-white/70" : "text-blue-500")} />
            : <EyeOff className={cn("w-4 h-4", isActive ? "text-white/50" : "text-gray-400")} />}
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
        "flex items-center rounded-xl border cursor-pointer transition-all select-none overflow-hidden group",
        isActive
          ? "bg-black border-black text-white shadow-md relative z-10"
          : "bg-white border-gray-200 hover:border-gray-300 text-gray-700 shadow-sm"
      )}
    >
      <div
        onPointerDown={(e) => controls.start(e)}
        className="w-8 flex items-center justify-center py-3 shrink-0 touch-none cursor-grab"
      >
        <GripVertical className={cn("w-4 h-4", isActive ? "text-white/50" : "text-gray-300 group-hover:text-gray-500")} />
      </div>
      <div
        className="flex items-center gap-2 flex-1 pr-3 py-3 min-w-0"
        onClick={onSelect}
      >
        <span className="text-base w-5 text-center shrink-0">{item.icon}</span>
        <span className="text-sm font-semibold flex-1 truncate">{item.title}</span>
        <button
          onClick={onToggle}
          className={cn(
            "p-1.5 rounded-lg transition-colors shrink-0",
            isActive ? "hover:bg-white/10" : "hover:bg-gray-100"
          )}
        >
          {item.enabled !== false
            ? <Eye className={cn("w-4 h-4", isActive ? "text-white/70" : "text-blue-500")} />
            : <EyeOff className={cn("w-4 h-4", isActive ? "text-white/50" : "text-gray-400")} />}
        </button>
        {onDelete && (
          <button
            onClick={onDelete}
            className={cn(
              "p-1.5 rounded-lg transition-colors shrink-0 hidden group-hover:flex",
              isActive ? "hover:bg-white/10" : "hover:bg-red-50 text-red-400"
            )}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </Reorder.Item>
  );
}

interface SidePanelProps {
  isCollapsed?: boolean;
  onExpand?: () => void;
}

export function SidePanel({ isCollapsed, onExpand }: SidePanelProps) {
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

  if (isCollapsed) {
    return (
      <div className="h-full flex flex-col items-center py-6 space-y-4 bg-slate-50 overflow-y-auto scrollbar-hide border-r border-gray-200/50">
        {/* Active Item */}
        <button onClick={onExpand} className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-500 hover:bg-blue-600 transition-colors shadow-sm shrink-0 group">
          <LayoutTemplate className="w-5 h-5 text-white" strokeWidth={2} />
        </button>
        
        {/* Inactive Items */}
        <button onClick={onExpand} className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-gray-200/60 transition-colors shrink-0 group">
          <Palette className="w-6 h-6 text-gray-400 group-hover:text-gray-600 transition-colors" strokeWidth={1.5} />
        </button>

        <button onClick={onExpand} className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-gray-200/60 transition-colors shrink-0 group">
          <Type className="w-6 h-6 text-gray-400 group-hover:text-gray-600 transition-colors" strokeWidth={1.5} />
        </button>

        <button onClick={onExpand} className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-gray-200/60 transition-colors shrink-0 group">
          <MoveHorizontal className="w-6 h-6 text-gray-400 group-hover:text-gray-600 transition-colors" strokeWidth={1.5} />
        </button>

        <button onClick={onExpand} className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-gray-200/60 transition-colors shrink-0 group">
          <Zap className="w-6 h-6 text-gray-400 group-hover:text-gray-600 transition-colors" strokeWidth={1.5} />
        </button>
      </div>
    );
  }

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
    <div className="h-full flex flex-col overflow-y-auto scrollbar-hide p-4">
      {/* ──── Layout ──── */}
      <CollapsibleSection 
        title="Layout" 
        icon={<div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center"><LayoutTemplate className="w-4 h-4 text-blue-600" /></div>}
        defaultOpen={true}
      >
        <div className="space-y-2 pt-1">
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
            className="space-y-2"
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
            className="w-full flex items-center justify-center gap-1.5 px-3 py-3 text-xs font-medium text-gray-500 border border-dashed border-gray-200 rounded-xl hover:border-gray-300 hover:text-gray-700 hover:bg-gray-50 transition-all mt-2"
          >
            <Plus className="w-4 h-4" />
            Add Module
          </button>
        </div>
      </CollapsibleSection>

      {/* ──── Theme Color ──── */}
      <CollapsibleSection 
        title="Theme Color" 
        icon={<div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center"><Palette className="w-4 h-4 text-purple-600" /></div>}
        defaultOpen={true}
      >
        <div className="space-y-4 pt-1">
          <div className="grid grid-cols-6 gap-2">
            {THEME_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setThemeColor(c)}
                className={cn(
                  "w-full aspect-square rounded-full border-2 transition-all hover:scale-110",
                  themeColor === c ? "border-gray-900 scale-110 shadow-sm" : "border-transparent"
                )}
                style={{ backgroundColor: c }}
              >
                {/* Optional inner circle for dark mode logic or just simple */}
                {themeColor === c && (
                   <div className="w-full h-full rounded-full border-2 border-white mix-blend-difference" />
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Custom</span>
              <div className="relative w-6 h-6 rounded-md overflow-hidden shadow-sm border border-gray-200">
                <input
                  type="color"
                  value={themeColor}
                  onChange={(e) => setThemeColor(e.target.value)}
                  className="absolute inset-[-10px] w-10 h-10 cursor-pointer border-0 p-0 bg-transparent"
                />
              </div>
            </div>
            <button 
              onClick={() => setThemeColor("#000000")}
              className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:text-blue-700"
            >
              Reset
            </button>
          </div>
        </div>
      </CollapsibleSection>

      {/* ──── Typography ──── */}
      <CollapsibleSection 
        title="Typography" 
        icon={<div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center"><Type className="w-4 h-4 text-emerald-600" /></div>}
        defaultOpen={false}
      >
        <div className="space-y-4 pt-1">
          {/* Base Font Size */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Font Size</span>
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
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Line Height</span>
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
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Header Size</span>
              <span className="text-[10px] text-gray-500 font-mono">{headerSize}px</span>
            </div>
            <select
              value={headerSize}
              onChange={(e) => updateGlobalSettings({ headerSize: parseInt(e.target.value) })}
              className="w-full text-xs font-medium border border-gray-200 rounded-lg px-2 py-2 bg-white text-gray-700 outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200 transition-all"
            >
              {[12, 13, 14, 15, 16, 18, 20, 24].map((s) => (
                <option key={s} value={s}>{s}px</option>
              ))}
            </select>
          </div>

          {/* Subheader Size */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Subheader Size</span>
              <span className="text-[10px] text-gray-500 font-mono">{subheaderSize}px</span>
            </div>
            <select
              value={subheaderSize}
              onChange={(e) => updateGlobalSettings({ subheaderSize: parseInt(e.target.value) })}
              className="w-full text-xs font-medium border border-gray-200 rounded-lg px-2 py-2 bg-white text-gray-700 outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200 transition-all"
            >
              {[12, 13, 14, 15, 16, 18, 20, 24].map((s) => (
                <option key={s} value={s}>{s}px</option>
              ))}
            </select>
          </div>
        </div>
      </CollapsibleSection>

      {/* ──── Spacing ──── */}
      <CollapsibleSection 
        title="Spacing" 
        icon={<div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center"><Space className="w-4 h-4 text-orange-600" /></div>}
        defaultOpen={false}
      >
        <div className="space-y-4 pt-1">
          {/* Page Padding */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Page Padding</span>
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
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Section Spacing</span>
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
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Paragraph Spacing</span>
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
      </CollapsibleSection>
    </div>
  );
}
