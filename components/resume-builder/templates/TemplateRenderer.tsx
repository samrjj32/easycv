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

const PageBreakLine = ({ pageNumber, top }: { pageNumber: number; top: number }) => {
  return (
    <div className="page-break-line" style={{ top: `${top}px` }}>
      <div className="page-break-badge">Page {pageNumber} End</div>
    </div>
  );
};

export function TemplateRenderer({ resumeRef }: { resumeRef?: React.RefObject<HTMLDivElement> }) {
  const { activeResume } = useResumeStore();
  const [contentHeight, setContentHeight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContentHeight(entry.contentRect.height);
      }
    });

    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, [activeResume?.templateId]); // Re-observe if template changes

  if (!activeResume) return null;

  const renderTemplate = () => {
    switch (activeResume.templateId) {
      case "classic": return <ClassicTemplate />;
      case "minimalist": return <MinimalistTemplate />;
      case "elegant": return <ElegantTemplate />;
      case "creative": return <CreativeTemplate />;
      case "left-right": return <LeftRightTemplate />;
      case "timeline": return <TimelineTemplate />;
      case "modern":
      default: return <ModernTemplate />;
    }
  };

  const pageBreaks = useMemo(() => {
    if (contentHeight <= 0) return [];
    
    // A4 dimensions at 96 DPI
    const A4_HEIGHT_PX = 1123;
    const pagePadding = activeResume.globalSettings?.pagePadding || 40;
    
    // The "actual" content area per page considering the padding
    // However, the template usually includes its own internal padding.
    // If we assume each page is exactly A4_HEIGHT_PX:
    const pageCount = Math.ceil(contentHeight / A4_HEIGHT_PX);
    
    return Array.from({ length: Math.max(0, pageCount - 1) }, (_, i) => ({
      pageNumber: i + 1,
      top: (i + 1) * A4_HEIGHT_PX
    }));
  }, [contentHeight, activeResume.globalSettings?.pagePadding]);

  return (
    <div className="relative">
      <div ref={resumeRef}>
        <div ref={containerRef} className="a4-page-container">
          {renderTemplate()}
        </div>
      </div>

      {/* Page Break Indicators Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="mx-auto w-[794px] relative h-full">
          {pageBreaks.map((pb) => (
            <PageBreakLine key={pb.pageNumber} pageNumber={pb.pageNumber} top={pb.top} />
          ))}
        </div>
      </div>
    </div>
  );
}
