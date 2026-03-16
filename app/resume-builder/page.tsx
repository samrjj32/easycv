"use client";

import { useResumeStore } from "@/lib/store/useResumeStore";
import { TemplateRenderer } from "@/components/resume-builder/templates/TemplateRenderer";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, Suspense, useRef, useState } from "react";
import Link from "next/link";
import { FileText, ChevronLeft, ChevronRight, Pencil, Undo, Redo, Download, Sparkles, RotateCcw, Loader2 } from "lucide-react";
import QuickPinchZoom, { make3dTransformValue } from "react-quick-pinch-zoom";
import { SidePanel } from "@/components/resume-builder/SidePanel";
import { EditPanel } from "@/components/resume-builder/EditPanel";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { usePdfExport } from "@/lib/hooks/usePdfExport";

function ResumeBuilderInner() {
  const { activeResume, setActiveResume, createResume, updateResume, mobileEditorView } = useResumeStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pinchZoomRef = useRef<any>(null);
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);

  // ── PDF export (works on iOS, Android, and desktop) ──────────────────────
  const { exportRef: resumeRef, handleExport, isExporting } = usePdfExport({
    filename: activeResume?.title || "resume",
    scale: 2,
    imageQuality: 0.98,
  });

  const onUpdate = ({ x, y, scale }: { x: number; y: number; scale: number }) => {
    const el = document.getElementById("zoom-target");
    if (el) el.style.transform = make3dTransformValue({ x, y, scale });
  };

  useEffect(() => {
    const id = searchParams.get("id");
    const template = searchParams.get("template");
    if (id) {
      setActiveResume(id);
    } else {
      const newId = createResume(template || "modern");
      router.replace(`/resume-builder?id=${newId}`);
    }
  }, [searchParams, setActiveResume, createResume, router]);

  if (!activeResume) {
    return (
      <div style={{
        height: "100svh", width: "100%",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "var(--bg)",
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 32, height: 32,
            border: "2px solid var(--border)",
            borderTopColor: "var(--accent)",
            borderRadius: "50%",
            animation: "spin 0.7s linear infinite",
          }} />
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Loading workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      height: "100svh", width: "100%",
      display: "flex", flexDirection: "column",
      background: "var(--bg)",
      overflow: "hidden",
    }}>
      {/* Top bar */}
      <header style={{
        height: 52, flexShrink: 0,
        borderBottom: "1px solid var(--border)",
        background: "var(--surface)",
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/" style={{
            display: "flex", alignItems: "center", gap: 6,
            textDecoration: "none",
          }}>
            <div style={{
              width: 22, height: 22,
              background: "var(--accent)", borderRadius: 4,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <FileText size={11} color="white" />
            </div>
            <span className="hidden sm:block" style={{
              fontSize: 13, fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 400,
              color: "var(--text)",
              letterSpacing: "-0.02em",
            }}>
              easycv
            </span>
          </Link>

          <div className="hidden sm:block" style={{ width: 1, height: 18, background: "var(--border)" }} />

          <Input
            value={activeResume.title}
            onChange={(e) => updateResume(activeResume.id, { title: e.target.value })}
            className="w-24 sm:w-48"
            style={{
              fontSize: 13, fontWeight: 500,
              color: "var(--text-2)",
              background: "transparent",
              border: "1px solid transparent",
              height: 30,
              borderRadius: 6,
              padding: "0 8px",
            }}
            placeholder="Resume Title"
            onFocus={e => (e.target.style.borderColor = "var(--border)")}
            onBlur={e => (e.target.style.borderColor = "transparent")}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button className="hidden sm:flex" style={tbBtn} disabled title="Undo"><Undo size={14} /></button>
          <button className="hidden sm:flex" style={tbBtn} disabled title="Redo"><Redo size={14} /></button>
          <div className="hidden sm:block" style={{ width: 1, height: 18, background: "var(--border)", margin: "0 2px" }} />
          <ThemeToggle />

          {/* ── Export button — now calls html2pdf directly ── */}
          <button
            onClick={handleExport}
            disabled={isExporting}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 12px",
              borderRadius: 6,
              border: "none",
              background: isExporting ? "var(--border)" : "var(--accent)",
              color: "white",
              fontSize: 12, fontWeight: 500,
              cursor: isExporting ? "not-allowed" : "pointer",
              fontFamily: "var(--font-body)",
              whiteSpace: "nowrap",
              opacity: isExporting ? 0.7 : 1,
              transition: "all 0.15s",
            }}
          >
            {isExporting
              ? <><Loader2 size={13} style={{ animation: "spin 0.7s linear infinite" }} /><span className="hidden sm:inline">Exporting…</span></>
              : <><Download size={13} /><span className="hidden sm:inline">Export PDF</span></>
            }
          </button>
        </div>
      </header>

      <main style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>
        {/* Left sidebar */}
        <div
          className={cn(
            "shrink-0 transition-all duration-300 ease-in-out relative",
            leftSidebarOpen
              ? "w-full lg:w-[256px] border-r"
              : "w-0 lg:w-[72px] border-transparent lg:border-r",
            mobileTab === "edit" && mobileEditorView === "menu" ? "block" : "hidden lg:block"
          )}
          style={{ borderColor: "var(--border)", background: "var(--surface)", overflow: "hidden" }}
        >
          <button
            onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
            style={{
              position: "absolute", top: 20, right: -12,
              width: 24, height: 24,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "50%",
              display: "none",
              alignItems: "center", justifyContent: "center",
              color: "var(--text-2)",
              cursor: "pointer",
              zIndex: 10,
            }}
            className="hidden lg:flex"
          >
            {leftSidebarOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
          </button>
          <div className={cn(
            "h-full overflow-y-auto overflow-x-hidden transition-all duration-300",
            leftSidebarOpen ? "w-full lg:w-[256px]" : "w-full lg:w-[72px]"
          )}>
            <SidePanel isCollapsed={!leftSidebarOpen} onExpand={() => setLeftSidebarOpen(true)} />
          </div>
        </div>

        {/* Preview area */}
        <div
          className={cn(
            "flex-1 flex flex-col items-center relative overflow-hidden",
            mobileTab === "preview" ? "flex" : "hidden lg:flex"
          )}
          style={{ background: "var(--bg-subtle)" }}
        >
          {/* Mobile reset view */}
          <div className="absolute top-3 right-3 z-30 flex flex-col gap-2 lg:hidden">
            <button
              onClick={() => pinchZoomRef.current?.alignCenter()}
              style={{
                width: 36, height: 36,
                borderRadius: "50%",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--text-2)", cursor: "pointer",
              }}
            >
              <RotateCcw size={14} />
            </button>
          </div>

          <div style={{ width: "100%", height: "100%", overflowY: "auto", overflowX: "hidden" }}>
            {/* Mobile pinch zoom */}
            <div className="w-full h-full block lg:hidden">
              <QuickPinchZoom
                ref={pinchZoomRef}
                onUpdate={onUpdate}
                containerProps={{ style: { width: "100%", height: "100%", background: "var(--bg-subtle)" } }}
              >
                <div id="zoom-target" className="origin-top-left p-4">
                  {/* exportRef wraps the CV so html2pdf captures it */}
                  <div ref={resumeRef} className="shadow-2xl bg-white mx-auto" style={{ width: 794 }}>
                    <TemplateRenderer />
                  </div>
                </div>
              </QuickPinchZoom>
            </div>

            {/* Desktop static */}
            <div className="hidden lg:flex flex-col items-center w-full" style={{ padding: 24 }}>
              <div
                className="origin-top shadow-xl transition-transform bg-white"
                style={{
                  transform: "scale(clamp(0.4, calc((100vw - 380px - 256px - 64px) / 794), 1))",
                  transformOrigin: "top center",
                  width: 794,
                }}
              >
                {/* exportRef wraps the CV so html2pdf captures it */}
                <div ref={resumeRef}>
                  <TemplateRenderer />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right edit panel */}
        <div
          className={cn(
            "shrink-0 overflow-y-auto overflow-x-hidden transition-all duration-300",
            activeResume.activeSection ? "w-full lg:w-[360px] border-l" : "w-0 border-transparent",
            mobileTab === "edit" && mobileEditorView === "form" ? "block" : "hidden lg:block"
          )}
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <div style={{ width: "100%", height: "100%" }}>
            <EditPanel />
          </div>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <div
        className="lg:hidden shrink-0 border-t flex items-center justify-around"
        style={{
          borderColor: "var(--border)",
          background: "var(--surface)",
          padding: "8px 0",
        }}
      >
        {[
          { key: "edit", label: "Edit", Icon: Pencil },
          { key: "preview", label: "Preview", Icon: Sparkles },
        ].map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setMobileTab(key as "edit" | "preview")}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              padding: "6px 20px", borderRadius: 8, border: "none",
              background: mobileTab === key ? "var(--accent-light)" : "transparent",
              color: mobileTab === key ? "var(--accent)" : "var(--text-muted)",
              fontSize: 11, fontWeight: 500, cursor: "pointer",
              fontFamily: "var(--font-body)",
            }}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

const tbBtn: React.CSSProperties = {
  width: 30, height: 30,
  display: "flex", alignItems: "center", justifyContent: "center",
  borderRadius: 6,
  border: "1px solid var(--border)",
  background: "transparent",
  color: "var(--text-muted)",
  cursor: "not-allowed",
  opacity: 0.5,
};

export default function ResumeBuilderPage() {
  return (
    <Suspense fallback={
      <div style={{
        height: "100svh", display: "flex",
        alignItems: "center", justifyContent: "center",
        background: "var(--bg)",
      }}>
        <div style={{
          width: 32, height: 32,
          border: "2px solid var(--border)",
          borderTopColor: "var(--accent)",
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite",
        }} />
      </div>
    }>
      <ResumeBuilderInner />
    </Suspense>
  );
}