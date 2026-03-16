"use client";

import React from "react";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { AnimatePresence, motion, Reorder } from "framer-motion";
import { Eye, EyeOff, GripVertical, Trash2, Plus, Palette, Type, Space, ChevronDown, LayoutTemplate, Zap } from "lucide-react";
import { useDragControls } from "framer-motion";
import { MenuSection } from "@/lib/types/resume";

const THEME_COLORS = [
  "#C4800F","#18160F","#1A3A5C","#1F4C2E",
  "#5C1A1A","#2D1A5C","#5C4A1A","#8F5E09",
  "#3D7A7A","#5C1A3A","#1A4C3D","#666666",
];

function CollapsibleSection({ title, icon, children, defaultOpen = true }: {
  title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  return (
    <div style={{
      border: "1px solid var(--border)", borderRadius: 10,
      background: "var(--surface)", overflow: "hidden", marginBottom: 10,
    }}>
      <button onClick={() => setIsOpen(!isOpen)} style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 14px", background: "transparent", border: "none",
        cursor: "pointer", fontFamily: "var(--font-body)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {icon}
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", letterSpacing: "0.02em" }}>{title}</span>
        </div>
        <ChevronDown size={14} style={{ color: "var(--text-muted)", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} style={{ overflow: "hidden" }}>
            <div style={{ padding: "0 14px 14px" }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ModuleItem({ item, isActive, isBasic, onSelect, onToggle, onDelete }: {
  item: MenuSection; isActive: boolean; isBasic?: boolean;
  onSelect: () => void; onToggle: (e: React.MouseEvent) => void; onDelete?: (e: React.MouseEvent) => void;
}) {
  const controls = useDragControls();
  const base: React.CSSProperties = {
    display: "flex", alignItems: "center", borderRadius: 8, cursor: "pointer",
    userSelect: "none", marginBottom: 4, transition: "all 0.12s",
    background: isActive ? "var(--accent)" : "var(--surface-2)",
    border: isActive ? "1px solid var(--accent)" : "1px solid var(--border)",
    color: isActive ? "white" : "var(--text)",
  };

  const eyeColor = isActive ? "rgba(255,255,255,0.7)" : "var(--text-muted)";

  if (isBasic) {
    return (
      <div onClick={onSelect} style={{ ...base, padding: "8px 10px" }}>
        <span style={{ fontSize: 14, width: 18, textAlign: "center", flexShrink: 0 }}>{item.icon}</span>
        <span style={{ fontSize: 12, fontWeight: 500, flex: 1, marginLeft: 8 }}>{item.title}</span>
        <button onClick={onToggle} style={{ background: "none", border: "none", cursor: "pointer", color: eyeColor, display: "flex" }}>
          {item.enabled !== false ? <Eye size={13} /> : <EyeOff size={13} />}
        </button>
      </div>
    );
  }

  return (
    <Reorder.Item value={item} dragListener={false} dragControls={controls} style={{ listStyle: "none" }}>
      <div style={base}>
        <div onPointerDown={e => controls.start(e)} style={{ width: 28, display: "flex", alignItems: "center", justifyContent: "center", padding: "8px 0", cursor: "grab", touchAction: "none" }}>
          <GripVertical size={13} style={{ color: isActive ? "rgba(255,255,255,0.5)" : "var(--text-muted)" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", flex: 1, padding: "8px 8px 8px 0", gap: 8 }} onClick={onSelect}>
          <span style={{ fontSize: 14, width: 18, textAlign: "center" }}>{item.icon}</span>
          <span style={{ fontSize: 12, fontWeight: 500, flex: 1 }}>{item.title}</span>
          <button onClick={onToggle} style={{ background: "none", border: "none", cursor: "pointer", color: eyeColor, display: "flex" }}>
            {item.enabled !== false ? <Eye size={13} /> : <EyeOff size={13} />}
          </button>
          {onDelete && (
            <button onClick={onDelete} style={{ background: "none", border: "none", cursor: "pointer", color: isActive ? "rgba(255,255,255,0.6)" : "var(--err-text)", display: "flex" }}>
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>
    </Reorder.Item>
  );
}

interface SidePanelProps { isCollapsed?: boolean; onExpand?: () => void; }

export function SidePanel({ isCollapsed, onExpand }: SidePanelProps) {
  const { activeResumeId, activeResume, updateResume, setActiveSection, setMobileEditorView,
    toggleSectionVisibility, setThemeColor, updateGlobalSettings } = useResumeStore();

  if (!activeResume) return null;

  if (isCollapsed) {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 0", gap: 6, background: "var(--surface)", overflowY: "auto" }}>
        {[LayoutTemplate, Palette, Type, Space, Zap].map((Icon, i) => (
          <button key={i} onClick={onExpand} style={{
            width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: 8, border: "1px solid var(--border)", cursor: "pointer",
            background: i === 0 ? "var(--accent-light)" : "var(--surface-2)",
            color: i === 0 ? "var(--accent)" : "var(--text-muted)",
          }}>
            <Icon size={16} />
          </button>
        ))}
      </div>
    );
  }

  const { menuSections = [], activeSection = "basic", globalSettings = {} } = activeResume;
  const { themeColor = "#C4800F", baseFontSize = 14, pagePadding = 40, lineHeight = 1.5, sectionSpacing = 24, paragraphSpacing = 12 } = globalSettings;

  const handleSelect = (id: string) => { setActiveSection(id); setMobileEditorView("form"); };
  const basicSection = menuSections.find(s => s.id === "basic");
  const draggableSections = menuSections.filter(s => s.id !== "basic");

  const sliderStyle: React.CSSProperties = { width: "100%", height: 3, appearance: "none", borderRadius: 2, background: "var(--border)", cursor: "pointer", outline: "none" };

  const labelRow = (label: string, val: string | number) => (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
      <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
      <span style={{ fontSize: 10, color: "var(--text-2)", fontFamily: "monospace" }}>{val}</span>
    </div>
  );

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: 12 }}>
      <CollapsibleSection title="Layout" defaultOpen icon={<LayoutTemplate size={14} style={{ color: "var(--accent)" }} />}>
        <div style={{ paddingTop: 4 }}>
          {basicSection && <ModuleItem item={basicSection} isBasic isActive={activeSection === basicSection.id} onSelect={() => handleSelect(basicSection.id)} onToggle={e => { e.stopPropagation(); toggleSectionVisibility(basicSection.id); }} />}
          <Reorder.Group axis="y" values={draggableSections}
            onReorder={newOrder => {
              // Update the `order` property so templates re-render in the new order
              const withOrder = newOrder.map((s, i) => ({ ...s, order: i + 1 }));
              updateResume(activeResumeId!, {
                menuSections: [
                  ...menuSections.filter(s => s.id === "basic").map(s => ({ ...s, order: 0 })),
                  ...withOrder,
                ],
              });
            }}
            style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <AnimatePresence>
              {draggableSections.map(item => (
                <ModuleItem key={item.id} item={item} isActive={activeSection === item.id}
                  onSelect={() => handleSelect(item.id)}
                  onToggle={e => { e.stopPropagation(); toggleSectionVisibility(item.id); }}
                  onDelete={item.id.startsWith("custom") ? e => { e.stopPropagation(); updateResume(activeResume.id, { menuSections: menuSections.filter(s => s.id !== item.id) }); } : undefined}
                />
              ))}
            </AnimatePresence>
          </Reorder.Group>
          <button onClick={() => { const n = menuSections.filter(s => s.id.startsWith("custom")).length + 1; updateResume(activeResume.id, { menuSections: [...menuSections, { id: `custom-${n}`, title: `Custom ${n}`, icon: "📝", enabled: true, order: menuSections.length }] }); }}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "7px 0", borderRadius: 7, marginTop: 4, border: "1px dashed var(--border)", background: "transparent", color: "var(--text-muted)", fontSize: 12, cursor: "pointer", fontFamily: "var(--font-body)" }}>
            <Plus size={12} /> Add Module
          </button>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Theme Color" defaultOpen icon={<Palette size={14} style={{ color: "var(--accent)" }} />}>
        <div style={{ paddingTop: 4 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6, marginBottom: 10 }}>
            {THEME_COLORS.map(c => (
              <button key={c} onClick={() => setThemeColor(c)} style={{ aspectRatio: "1/1", borderRadius: "50%", border: "none", cursor: "pointer", background: c, outline: themeColor === c ? "2px solid var(--text)" : "2px solid transparent", outlineOffset: 1, transform: themeColor === c ? "scale(1.15)" : "scale(1)", transition: "all 0.12s" }} />
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ position: "relative", width: 28, height: 28, borderRadius: 6, overflow: "hidden", border: "1px solid var(--border)" }}>
              <input type="color" value={themeColor} onChange={e => setThemeColor(e.target.value)} style={{ position: "absolute", inset: -6, width: 40, height: 40, cursor: "pointer", border: "none", padding: 0 }} />
            </div>
            <span style={{ fontSize: 11, color: "var(--text-muted)", flex: 1 }}>Custom colour</span>
            <button onClick={() => setThemeColor("#C4800F")} style={{ fontSize: 10, color: "var(--accent)", background: "none", border: "none", cursor: "pointer", fontWeight: 600, fontFamily: "var(--font-body)" }}>Reset</button>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Typography" defaultOpen={false} icon={<Type size={14} style={{ color: "var(--accent)" }} />}>
        <div style={{ paddingTop: 4, display: "flex", flexDirection: "column", gap: 14 }}>
          <div>{labelRow("Font Size", `${baseFontSize}px`)}<input type="range" min={12} max={20} step={1} value={baseFontSize} onChange={e => updateGlobalSettings({ baseFontSize: parseInt(e.target.value) })} style={sliderStyle} /></div>
          <div>{labelRow("Line Height", lineHeight)}<input type="range" min={1} max={2} step={0.1} value={lineHeight} onChange={e => updateGlobalSettings({ lineHeight: parseFloat(e.target.value) })} style={sliderStyle} /></div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Spacing" defaultOpen={false} icon={<Space size={14} style={{ color: "var(--accent)" }} />}>
        <div style={{ paddingTop: 4, display: "flex", flexDirection: "column", gap: 14 }}>
          <div>{labelRow("Page Padding", `${pagePadding}px`)}<input type="range" min={20} max={80} step={2} value={pagePadding} onChange={e => updateGlobalSettings({ pagePadding: parseInt(e.target.value) })} style={sliderStyle} /></div>
          <div>{labelRow("Section Spacing", `${sectionSpacing}px`)}<input type="range" min={4} max={60} step={2} value={sectionSpacing} onChange={e => updateGlobalSettings({ sectionSpacing: parseInt(e.target.value) })} style={sliderStyle} /></div>
          <div>{labelRow("Paragraph Spacing", `${paragraphSpacing}px`)}<input type="range" min={2} max={30} step={1} value={paragraphSpacing} onChange={e => updateGlobalSettings({ paragraphSpacing: parseInt(e.target.value) })} style={sliderStyle} /></div>
        </div>
      </CollapsibleSection>
    </div>
  );
}