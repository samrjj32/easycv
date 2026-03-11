"use client";

import React from "react";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Github, 
  Linkedin, 
  Twitter, 
  Globe, 
  Link as LinkIcon 
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ICONS = {
  User,
  Mail,
  Phone,
  MapPin,
  Github,
  Linkedin,
  Twitter,
  Globe,
  Link: LinkIcon
};

interface IconSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function IconSelector({ value, onChange }: IconSelectorProps) {
  const SelectedIcon = ICONS[value as keyof typeof ICONS] || User;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="w-10 h-10 rounded-xl border-gray-100 bg-gray-50/50 hover:bg-gray-100 transition-all active:scale-95"
          title="Change Icon"
        >
          <SelectedIcon className="w-5 h-5 text-gray-600" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2 rounded-2xl shadow-xl border-gray-100" align="start">
        <div className="grid grid-cols-3 gap-1">
          {Object.entries(ICONS).map(([name, Icon]) => (
            <Button
              key={name}
              variant="ghost"
              size="icon"
              className={cn(
                "w-12 h-12 rounded-xl transition-all",
                value === name ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-50"
              )}
              onClick={() => onChange(name)}
            >
              <Icon className="w-5 h-5" />
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
