"use client";

import { useResumeStore } from "@/lib/store/useResumeStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Layout, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const templates = [
  {
    id: "modern",
    name: "Modern Professional",
    description: "Clean, multi-column layout with a sidebar for skills and contact info.",
    image: "/templates/modern.png",
    color: "bg-blue-600"
  },
  {
    id: "classic",
    name: "Classic Executive",
    description: "Single column, traditional layout ideal for corporate roles.",
    image: "/templates/classic.png",
    color: "bg-gray-900"
  },
  {
    id: "minimalist",
    name: "Minimalist",
    description: "Focuses on content with generous whitespace and elegant typography.",
    image: "/templates/minimalist.png",
    color: "bg-white border-2 border-gray-200"
  },
  {
    id: "elegant",
    name: "Elegant",
    description: "Centered divider titles with refined serif typography and generous spacing.",
    image: "/templates/elegant.png",
    color: "bg-zinc-800"
  },
  {
    id: "creative",
    name: "Creative",
    description: "Bold colored header block with photo — perfect for creative professionals.",
    image: "/templates/creative.png",
    color: "bg-indigo-600"
  },
  {
    id: "left-right",
    name: "Left-Right",
    description: "Colored section title bars with a professional two-tone layout.",
    image: "/templates/left-right.png",
    color: "bg-blue-700"
  },
  {
    id: "timeline",
    name: "Timeline",
    description: "Vertical timeline with dots and lines — shows career progression beautifully.",
    image: "/templates/timeline.png",
    color: "bg-violet-600"
  }
];

interface TemplateSelectorProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function TemplateSelector({ isOpen, onClose }: TemplateSelectorProps) {
  const { activeResume, setTemplate } = useResumeStore();

  if (!activeResume) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-8">
        <DialogHeader className="mb-8">
          <DialogTitle className="text-3xl font-bold font-inter tracking-tight">Select a Template</DialogTitle>
          <p className="text-gray-500 text-lg">Choose a design that best fits your professional style.</p>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div 
              key={template.id}
              onClick={() => {
                setTemplate(template.id);
                onClose?.();
              }}
              className={cn(
                "group relative cursor-pointer flex flex-col rounded-3xl border-2 transition-all overflow-hidden",
                activeResume.templateId === template.id 
                  ? "border-blue-500 shadow-xl shadow-blue-100 ring-2 ring-blue-500 ring-offset-2" 
                  : "border-gray-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50/50"
              )}
            >
              <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex flex-col gap-3">
                   <div className={cn("w-1/3 h-2 rounded-full", template.color)} />
                   <div className="w-full h-4 bg-white rounded-md shadow-sm" />
                   <div className="w-2/3 h-3 bg-white/50 rounded-md" />
                   <div className="mt-auto grid grid-cols-2 gap-2">
                      <div className="h-20 bg-white/80 rounded-xl" />
                      <div className="h-20 bg-white/80 rounded-xl" />
                   </div>
                </div>
              </div>

              <div className="p-5 bg-white border-t border-gray-50 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">{template.name}</h3>
                  {activeResume.templateId === template.id && (
                    <CheckCircle2 className="w-5 h-5 text-blue-500 fill-blue-50" />
                  )}
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{template.description}</p>
              </div>

              {activeResume.templateId === template.id && (
                <div className="absolute top-4 right-4 animate-in zoom-in duration-300">
                  <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    CURRENTLY ACTIVE
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 flex justify-end gap-3">
           <Button variant="ghost" className="rounded-xl px-6" onClick={onClose}>Cancel</Button>
           <Button 
            className="rounded-xl px-8 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
            onClick={onClose}
           >
             Apply Selection
           </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
