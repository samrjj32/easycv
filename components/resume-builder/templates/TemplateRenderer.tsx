"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { ModernTemplate } from "./ModernTemplate";
import { ClassicTemplate } from "./ClassicTemplate";
import { MinimalistTemplate } from "./MinimalistTemplate";
import { ElegantTemplate } from "./ElegantTemplate";
import { CreativeTemplate } from "./CreativeTemplate";
import { LeftRightTemplate } from "./LeftRightTemplate";
import { TimelineTemplate } from "./TimelineTemplate";

// Page break lines are builder-only UI — hidden in PDF export via CSS class
const PageBreakLine = ({ pageNumber, top }: { pageNumber: number; top: number }) => (
  <div
    className="page-break-line no-print"
    style={{ top: `${top}px` }}
  >
    <div className="page-break-badge no-print">Page {pageNumber} End</div>
  </div>
);

/**
 * resumeRef is optional.
 * The resume builder page wraps this component with usePdfExport's exportRef,
 * which is what gets captured and sent to the server PDF endpoint.
 */
export function TemplateRenderer({ resumeRef }: { resumeRef?: React.RefObject<HTMLDivElement> }) {
  const { activeResume } = useResumeStore();
  const [contentHeight, setContentHeight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setContentHeight(entry.contentRect.height);
      }
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [activeResume?.templateId]);

  if (!activeResume) return null;

  const renderTemplate = () => {
    switch (activeResume.templateId) {
      case "classic":    return <ClassicTemplate />;
      case "minimalist": return <MinimalistTemplate />;
      case "elegant":    return <ElegantTemplate />;
      case "creative":   return <CreativeTemplate />;
      case "left-right": return <LeftRightTemplate />;
      case "timeline":   return <TimelineTemplate />;
      case "modern":
      default:           return <ModernTemplate />;
    }
  };

  const pageBreaks = useMemo(() => {
    if (contentHeight <= 0) return [];
    const A4_HEIGHT_PX = 1123;
    const pageCount = Math.ceil(contentHeight / A4_HEIGHT_PX);
    return Array.from({ length: Math.max(0, pageCount - 1) }, (_, i) => ({
      pageNumber: i + 1,
      top: (i + 1) * A4_HEIGHT_PX,
    }));
  }, [contentHeight, activeResume.globalSettings?.pagePadding]);

  return (
    <div className="relative">
      {/* resumeRef (from legacy callers) or just the inner container */}
      <div ref={resumeRef}>
        {/*
          id="resume-preview" matches the magicv.art convention —
          makes it easy to querySelector the element from outside if needed.
        */}
        <div id="resume-preview" ref={containerRef} className="a4-page-container">
          {renderTemplate()}
        </div>
      </div>

      {/* Page break indicators — screen only, hidden in PDF via .no-print class */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden no-print">
        <div className="mx-auto w-[794px] relative h-full">
          {pageBreaks.map(pb => (
            <PageBreakLine key={pb.pageNumber} pageNumber={pb.pageNumber} top={pb.top} />
          ))}
        </div>
      </div>
    </div>
  );
}