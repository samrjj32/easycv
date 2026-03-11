"use client";

import { useResumeStore } from "@/lib/store/useResumeStore";
import { ModernTemplate } from "./ModernTemplate";
import { ClassicTemplate } from "./ClassicTemplate";
import { MinimalistTemplate } from "./MinimalistTemplate";
import { ElegantTemplate } from "./ElegantTemplate";
import { CreativeTemplate } from "./CreativeTemplate";
import { LeftRightTemplate } from "./LeftRightTemplate";
import { TimelineTemplate } from "./TimelineTemplate";

export function TemplateRenderer({ resumeRef }: { resumeRef?: React.RefObject<HTMLDivElement> }) {
  const { activeResume } = useResumeStore();
  
  if (!activeResume) return null;

  const renderTemplate = () => {
    switch (activeResume.templateId) {
      case "classic":
        return <ClassicTemplate />;
      case "minimalist":
        return <MinimalistTemplate />;
      case "elegant":
        return <ElegantTemplate />;
      case "creative":
        return <CreativeTemplate />;
      case "left-right":
        return <LeftRightTemplate />;
      case "timeline":
        return <TimelineTemplate />;
      case "modern":
      default:
        return <ModernTemplate />;
    }
  };

  return (
    <div ref={resumeRef} className="a4-page-container">
      {renderTemplate()}
    </div>
  );
}
