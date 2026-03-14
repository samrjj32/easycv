"use client";

import React, { useRef, useState } from "react";
import { User, Upload, PlusCircle, Trash2, Eye, EyeOff, X } from "lucide-react";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { CustomFieldType } from "@/lib/types/resume";
import { Button } from "@/components/ui/button";
import Field from "./Field";
import AlignSelector from "./AlignSelector";

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

export function BasicInfoEditor() {
  const { activeResume, updateBasicInfo } = useResumeStore();

  if (!activeResume) return null;
  const { basic } = activeResume;

  // Custom fields
  const customFields: CustomFieldType[] = basic.customFields || [];

  const addCustomField = () => {
    const newField: CustomFieldType = { id: generateId(), label: "", value: "", icon: "User", visible: true };
    updateBasicInfo({ customFields: [...customFields, newField] });
  };

  const updateCustomField = (id: string, changes: Partial<CustomFieldType>) => {
    updateBasicInfo({
      customFields: customFields.map((f) => (f.id === id ? { ...f, ...changes } : f)),
    });
  };

  const removeCustomField = (id: string) => {
    updateBasicInfo({ customFields: customFields.filter((f) => f.id !== id) });
  };

  return (
    <div className="space-y-5 pb-20">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <span className="w-7 h-7 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
          <User className="w-3.5 h-3.5" />
        </span>
        <h2 className="text-sm font-bold text-gray-900">Basic Information</h2>
      </div>

      {/* Alignment selector */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Align</p>
        <AlignSelector
          value={basic.layout || "center"}
          onChange={(v) => updateBasicInfo({ layout: v })}
        />
      </div>

      {/* Core fields */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Full Name" value={basic.name || ""} onChange={(v) => updateBasicInfo({ name: v })} placeholder="Your Name" />
          <Field label="Job Title" value={basic.title || ""} onChange={(v) => updateBasicInfo({ title: v })} placeholder="e.g. Software Engineer" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Email" value={basic.email || ""} onChange={(v) => updateBasicInfo({ email: v })} placeholder="you@example.com" />
          <Field label="Phone" value={basic.phone || ""} onChange={(v) => updateBasicInfo({ phone: v })} placeholder="+1 (555) 000-0000" />
        </div>
        <Field label="Location" value={basic.location || ""} onChange={(v) => updateBasicInfo({ location: v })} placeholder="City, State, Country" />
        <Field
          label="Employment Status"
          value={basic.employementStatus || ""}
          onChange={(v) => updateBasicInfo({ employementStatus: v })}
          placeholder="e.g. Open to opportunities"
        />
      </div>

      {/* Custom fields */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Custom Fields</span>
        </div>

        {customFields.map((field) => (
          <div key={field.id} className="flex items-center gap-2 bg-gray-50 rounded-xl p-2 border border-gray-100">
            <div className="flex-1 grid grid-cols-2 gap-2">
              <Field
                value={field.label || ""}
                onChange={(v) => updateCustomField(field.id, { label: v })}
                placeholder="Label (e.g. LinkedIn)"
              />
              <Field
                value={field.value || ""}
                onChange={(v) => updateCustomField(field.id, { value: v })}
                placeholder="Value"
              />
            </div>
            <button
              onClick={() => updateCustomField(field.id, { visible: !field.visible })}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
            >
              {field.visible !== false ? (
                <Eye className="w-3.5 h-3.5 text-blue-500" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 text-gray-300" />
              )}
            </button>
            <button
              onClick={() => removeCustomField(field.id)}
              className="p-1.5 rounded-lg hover:bg-red-50 transition-colors shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
            </button>
          </div>
        ))}

        <Button
          onClick={addCustomField}
          variant="outline"
          className="w-full h-9 border-dashed border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-500 rounded-xl text-xs transition-all"
        >
          <PlusCircle className="w-3.5 h-3.5 mr-2" />
          Add Custom Field
        </Button>
      </div>
    </div>
  );
}
