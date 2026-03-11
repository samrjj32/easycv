"use client";

import React from "react";
import { AlignLeft } from "lucide-react";
import { useResumeStore } from "@/lib/store/useResumeStore";
import Field from "./Field";

export function SummaryEditor() {
  const { activeResume, updateSummaryContent } = useResumeStore();

  if (!activeResume) return null;
  const { summaryContent = "" } = activeResume;

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center gap-2">
        <span className="w-7 h-7 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
          <AlignLeft className="w-3.5 h-3.5" />
        </span>
        <h2 className="text-sm font-bold text-gray-900">Summary</h2>
      </div>

      <p className="text-xs text-gray-400 leading-relaxed">
        Write a brief professional summary — this content will render directly in the preview.
      </p>

      <Field
        type="editor"
        value={summaryContent}
        onChange={updateSummaryContent}
        placeholder="Experienced software engineer with 5+ years of expertise in building scalable web applications..."
      />
    </div>
  );
}
