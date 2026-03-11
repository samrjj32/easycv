"use client";

import React from "react";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  LayoutTemplate, 
  RotateCcw, 
  Undo, 
  Redo, 
  Monitor, 
  Smartphone, 
  FileText 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TemplateSelector } from "./TemplateSelector";

export function PreviewDock({ onPrint }: { onPrint: () => void }) {
  const [showTemplates, setShowTemplates] = React.useState(false);

  return (
    <div className="h-full w-14 bg-white border-l flex flex-col items-center py-6 gap-6 shadow-sm z-10">
      {/* Action Group 1: Output */}
      <div className="flex flex-col gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPrint}
          className="w-10 h-10 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all hover:scale-110"
          title="Download PDF"
        >
          <Download className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowTemplates(true)}
          className="w-10 h-10 rounded-xl hover:bg-purple-50 hover:text-purple-600 transition-all hover:scale-110"
          title="Change Template"
        >
          <LayoutTemplate className="w-5 h-5" />
        </Button>
      </div>

      <div className="w-8 h-px bg-gray-100" />

      {/* Action Group 2: View Controls */}
      <div className="flex-1 flex flex-col gap-2">
         {/* Could add zoom/view toggles here */}
      </div>

       <div className="w-8 h-px bg-gray-100" />

      {/* Action Group 3: History (Placeholders) */}
       <div className="flex flex-col gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 rounded-xl hover:bg-gray-100 text-gray-400 cursor-not-allowed"
          disabled
        >
          <Undo className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 rounded-xl hover:bg-gray-100 text-gray-400 cursor-not-allowed"
          disabled
        >
          <Redo className="w-4 h-4" />
        </Button>
      </div>

      <TemplateSelector 
        isOpen={showTemplates} 
        onClose={() => setShowTemplates(false)} 
      />
    </div>
  );
}
