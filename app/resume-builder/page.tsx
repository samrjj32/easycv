"use client";

import { useResumeStore } from "@/lib/store/useResumeStore";
import { TemplateRenderer } from "@/components/resume-builder/templates/TemplateRenderer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useReactToPrint } from "react-to-print";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, Suspense, useRef, useState } from "react";
import Link from "next/link";
import { FileText, ChevronLeft, ChevronRight, Pencil, Undo, Redo, LayoutTemplate, Download, Sparkles, PanelLeftClose, PanelLeftOpen, RotateCcw, Plus, Minus } from "lucide-react";
import QuickPinchZoom, { make3dTransformValue } from 'react-quick-pinch-zoom';
import { SidePanel } from "@/components/resume-builder/SidePanel";
import { EditPanel } from "@/components/resume-builder/EditPanel";
import { cn } from "@/lib/utils";

function ResumeBuilderInner() {
  const { activeResume, setActiveResume, createResume, updateResume, mobileEditorView } = useResumeStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const resumeRef = useRef<HTMLDivElement>(null);
  const pinchZoomRef = useRef<any>(null);
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);

  // Function to handle zoom/pan updates
  const onUpdate = ({ x, y, scale }: { x: number; y: number; scale: number }) => {
    const el = document.getElementById('zoom-target');
    if (el) {
      el.style.transform = make3dTransformValue({ x, y, scale });
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: resumeRef,
    documentTitle: activeResume?.title || "resume",
  });

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
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-medium text-sm">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-white overflow-hidden">
      {/* Top bar logic... skipped for brevity as it is identical */}
      <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4 sm:px-6 z-20 shrink-0">
        <div className="flex items-center h-full gap-3 sm:gap-4">
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 sm:mr-1">
            <div className="w-[22px] h-[22px] sm:w-6 sm:h-6 bg-blue-600 rounded flex items-center justify-center">
              <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-[15px] tracking-tight hidden sm:block italic">AutoApply</span>
          </Link>
          <Separator orientation="vertical" className="h-5 bg-gray-200 hidden sm:block" />
          <Input
            value={activeResume.title}
            onChange={(e) => updateResume(activeResume.id, { title: e.target.value })}
            className="hidden sm:flex font-medium text-[15px] text-gray-500 italic bg-transparent border-0 shadow-none focus-visible:ring-1 focus-visible:ring-gray-300 px-2 h-8 hover:bg-gray-50 rounded-md transition-colors w-[220px]"
            placeholder="Resume Title"
          />
        </div>
        <div className="flex items-center h-full gap-2 text-gray-400">
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full hover:bg-gray-100 text-gray-400" disabled title="Undo"><Undo className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full hover:bg-gray-100 text-gray-400" disabled title="Redo"><Redo className="w-4 h-4" /></Button>
          </div>
          <Separator orientation="vertical" className="h-5 bg-gray-200 mx-2" />
          <Button size="sm" onClick={() => handlePrint()} className="gap-2 bg-blue-600 hover:bg-blue-700 h-9 px-4 rounded-lg shadow-sm transition-all active:scale-95">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-row overflow-hidden min-h-0 relative">
        {/* Column 1: Sidebar */}
        <div className={cn(
          "shrink-0 bg-white transition-all duration-300 ease-in-out relative z-10",
          leftSidebarOpen ? "w-full lg:w-[260px] border-r border-gray-200" : "w-0 lg:w-[80px] border-transparent lg:border-r lg:border-gray-200",
          (mobileTab === "edit" && mobileEditorView === "menu") ? "block" : "hidden lg:block"
        )}>
          <button
            onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
            className="absolute top-6 -right-3.5 w-7 h-7 bg-white border border-gray-200 rounded-full hidden lg:flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 shadow-sm z-20"
          >
            {leftSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          <div className={cn("h-full overflow-y-auto overflow-x-hidden transition-all duration-300", leftSidebarOpen ? "w-full lg:w-[260px]" : "w-full lg:w-[80px]")}>
            <SidePanel isCollapsed={!leftSidebarOpen} onExpand={() => setLeftSidebarOpen(true)} />
          </div>
        </div>

        {/* Column 2: Preview - With Pinch Zoom & Panning for Mobile */}
        <div className={cn(
          "flex-1 flex flex-col items-center relative bg-gray-100/50 overflow-hidden",
          mobileTab === "preview" ? "flex" : "hidden lg:flex"
        )}>
          {/* Zoom Actions - Mobile/Tablet only */}
          <div className="absolute top-4 right-4 z-30 flex flex-col gap-2 lg:hidden">
            <Button
              variant="outline"
              size="icon"
              onClick={() => pinchZoomRef.current?.alignCenter()}
              className="w-10 h-10 rounded-full bg-white shadow-lg border-gray-200 text-gray-600"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          <div className="w-full h-full lg:p-6 p-0 overflow-y-auto overflow-x-hidden lg:flex lg:flex-col lg:items-center">
            {/* Mobile/Tablet: Pinch-to-zoom container */}
            <div className="w-full h-full block lg:hidden">
              <QuickPinchZoom
                ref={pinchZoomRef}
                onUpdate={onUpdate}
                // @ts-ignore
                minZoom={0.5}
                // @ts-ignore
                maxZoom={3}
                containerProps={{
                  style: { width: '100%', height: '100%', background: '#f3f4f6' }
                }}
              >
                <div id="zoom-target" className="origin-top-left p-4">
                  <div 
                    className="shadow-2xl bg-white mx-auto"
                    style={{ 
                      width: "794px", // Fixed A4 width
                    }}
                  >
                    <TemplateRenderer resumeRef={resumeRef} />
                  </div>
                </div>
              </QuickPinchZoom>
            </div>

            {/* Desktop: Static preview with auto-scaling */}
            <div className="hidden lg:flex flex-col items-center w-full">
              <div 
                className="origin-top shadow-xl transition-transform" 
                style={{ 
                  transform: "scale(clamp(0.4, calc((100vw - 380px - 260px - 64px) / 794), 1))",
                  transformOrigin: "top center",
                  width: "794px",
                }}
              >
                <div className="bg-white">
                  <TemplateRenderer resumeRef={resumeRef} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Editor panel */}
        <div className={cn(
          "shrink-0 bg-white overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out",
          activeResume.activeSection ? "w-full lg:w-[380px] border-l border-gray-200" : "w-0 border-transparent",
          (mobileTab === "edit" && mobileEditorView === "form") ? "block" : "hidden lg:block"
        )}>
          <div className="w-full lg:w-[380px] h-full">
            <EditPanel />
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden shrink-0 border-t border-gray-200 bg-white flex items-center justify-around p-2 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-20">
        <button
          onClick={() => setMobileTab("edit")}
          className={cn(
            "flex flex-col items-center gap-1 p-2 rounded-lg text-xs font-medium min-w-[80px]",
            mobileTab === "edit" ? "text-blue-600 bg-blue-50" : "text-gray-500 hover:text-gray-900"
          )}
        >
          <Pencil className="w-5 h-5" />
          Edit
        </button>
        <button
          onClick={() => setMobileTab("preview")}
          className={cn(
            "flex flex-col items-center gap-1 p-2 rounded-lg text-xs font-medium min-w-[80px]",
            mobileTab === "preview" ? "text-blue-600 bg-blue-50" : "text-gray-500 hover:text-gray-900"
          )}
        >
          <Sparkles className="w-5 h-5" />
          Preview
        </button>
      </div>

    </div>
  );
}

export default function ResumeBuilderPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ResumeBuilderInner />
    </Suspense>
  );
}
