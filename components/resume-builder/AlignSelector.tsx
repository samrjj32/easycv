"use client";

import React from "react";
import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlignSelectorProps {
  value: "left" | "center" | "right";
  onChange: (value: "left" | "center" | "right") => void;
}

export default function AlignSelector({ value, onChange }: AlignSelectorProps) {
  const options = [
    { id: "left" as const, icon: AlignLeft, label: "Left" },
    { id: "center" as const, icon: AlignCenter, label: "Center" },
    { id: "right" as const, icon: AlignRight, label: "Right" },
  ];

  return (
    <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onChange(option.id)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
            value === option.id
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
          )}
        >
          <option.icon className="w-4 h-4" />
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
}
