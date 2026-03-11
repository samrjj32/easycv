"use client";

import { useResumeStore } from "@/lib/store/useResumeStore";
import { TemplateRenderer } from "@/components/resume-builder/templates/TemplateRenderer";
import { Button } from "@/components/ui/button";
import { useReactToPrint } from "react-to-print";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, Suspense, useRef, useState } from "react";
import Link from "next/link";
import { FileText, Save, Share2, Sparkles, ChevronLeft, Pencil } from "lucide-react";
import { SidePanel } from "@/components/resume-builder/SidePanel";
import { EditPanel } from "@/components/resume-builder/EditPanel";
import { PreviewDock } from "@/components/resume-builder/PreviewDock";
import { TemplateSelector } from "@/components/resume-builder/TemplateSelector";
import { cn } from "@/lib/utils";

function ResumeBuilderInner() {
  const { activeResume, setActiveResume, createResume, updateResume, mobileEditorView } = useResumeStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const resumeRef = useRef<HTMLDivElement>(null);
  const [templateSelectorOpen, setTemplateSelectorOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");

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
      // Create a new resume with the chosen template
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
      {/* Top bar */}
      <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4 z-20 shrink-0">
        <div className="flex items-center gap-2.5">
          {/* Back to templates */}
          <Link
            href="/"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-xs font-medium"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Templates
          </Link>

          <div className="w-px h-5 bg-gray-200" />

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm tracking-tight hidden sm:block">AutoApply</span>
          </Link>

          <div className="w-px h-5 bg-gray-200" />

          {/* Resume title */}
          <input
            value={activeResume.title}
            onChange={(e) => updateResume(activeResume.id, { title: e.target.value })}
            className="font-medium text-sm text-gray-700 bg-transparent border-none focus:ring-0 p-1.5 hover:bg-gray-50 rounded-lg transition-colors w-full max-w-[200px] outline-none"
            placeholder="Resume Title"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTemplateSelectorOpen(true)}
            className="gap-1.5 text-gray-500 hover:text-gray-700 h-8 px-3 text-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Change Template</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-1.5 text-gray-500 h-8 px-3 text-xs">
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => handlePrint()}
            className="gap-1.5 bg-blue-600 hover:bg-blue-700 h-8 px-4 text-xs rounded-lg shadow-sm transition-all active:scale-95"
          >
            <Save className="w-3.5 h-3.5" />
            Export PDF
          </Button>
        </div>
      </header>

      {/* 3-column body */}
      <main className="flex-1 flex flex-row overflow-hidden min-h-0 relative">
        {/* Column 1: Module list sidebar */}
        <div className={cn(
          "shrink-0 border-r border-gray-200 bg-gray-50/50 overflow-y-auto",
          "w-full lg:w-[220px]",
          (mobileTab === "edit" && mobileEditorView === "menu") ? "block" : "hidden lg:block"
        )}>
          <SidePanel />
        </div>

        {/* Column 2: Editor panel */}
        <div className={cn(
          "shrink-0 border-r border-gray-200 bg-white overflow-y-auto",
          "w-full lg:w-[420px]",
          (mobileTab === "edit" && mobileEditorView === "form") ? "block" : "hidden lg:block"
        )}>
          <EditPanel />
        </div>

        {/* Column 3: Preview + Dock */}
        <div className={cn(
          "flex-1 flex flex-row overflow-hidden",
          mobileTab === "preview" ? "flex" : "hidden lg:flex"
        )}>
          <div className="flex-1 bg-gray-100 overflow-y-auto overflow-x-hidden flex flex-col items-center p-4 sm:p-6" style={{
            // Add a CSS variable to calculate scale for mobile based on A4 width (794px)
            // @ts-ignore
            "--mobile-scale": "clamp(0.4, calc((100vw - 32px) / 794), 1)"
          }}>
            <div 
              className="origin-top shadow-xl transition-transform" 
              style={{ 
                transform: "scale(var(--mobile-scale, 1))",
                transformOrigin: "top center",
                width: "794px",
                marginBottom: "calc(1123px * (var(--mobile-scale, 1) - 1))" // Reduce the bounding box height to avoid massive whitespace at the bottom
              }}
            >
              <div className="bg-white">
                <TemplateRenderer resumeRef={resumeRef} />
              </div>
            </div>
          </div>
          <PreviewDock onPrint={() => handlePrint()} />
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

      {/* Template selector dialog */}
      <TemplateSelector
        isOpen={templateSelectorOpen}
        onClose={() => setTemplateSelectorOpen(false)}
      />
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
