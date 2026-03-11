"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { RichTextEditor } from "./RichTextEditor";

interface FieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "textarea" | "editor" | "date";
  placeholder?: string;
  required?: boolean;
  className?: string;
  showPresentSwitch?: boolean;
}

const Field = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  className,
  showPresentSwitch,
}: FieldProps) => {
  const isPresentValue = value === "Present" || value.endsWith(" - Present");

  const handlePresentToggle = (checked: boolean) => {
    if (type === "date") {
      onChange(checked ? "Present" : "");
    } else {
      const [start] = value.split(" - ");
      onChange(checked ? `${start || ""} - Present` : start || "");
    }
  };

  const renderLabel = () => {
    if (!label) return null;
    return (
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {label}
        </span>
        {showPresentSwitch && (
          <div className="flex items-center gap-2">
            <Switch
              checked={isPresentValue}
              onCheckedChange={handlePresentToggle}
            />
            <span className="text-xs text-gray-400">Present</span>
          </div>
        )}
      </div>
    );
  };

  const inputStyles = cn(
    "block w-full rounded-xl border border-gray-100 py-2.5 px-3",
    "text-gray-900 bg-gray-50/60 text-sm",
    "placeholder:text-gray-400",
    "focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/20",
    "transition-all duration-200",
    className
  );

  if (type === "editor") {
    return (
      <div className="block">
        {renderLabel()}
        <RichTextEditor content={value || ""} onChange={onChange} />
      </div>
    );
  }

  if (type === "textarea") {
    return (
      <div className="block">
        {renderLabel()}
        <motion.textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(inputStyles, "min-h-[90px] resize-none leading-relaxed")}
          required={required}
          rows={3}
          whileHover={{ scale: 1.002 }}
          whileTap={{ scale: 0.998 }}
        />
      </div>
    );
  }

  return (
    <div className="block">
      {renderLabel()}
      <motion.input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputStyles}
        required={required}
        whileHover={{ scale: 1.002 }}
        whileTap={{ scale: 0.998 }}
      />
    </div>
  );
};

export default Field;
