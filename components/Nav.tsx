"use client";

import Link from "next/link";
import { FileText, Sparkles } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Templates", key: "templates" },
  { href: "/generate", label: "AI Generate", key: "generate", icon: "sparkles" },
  { href: "/profile", label: "My CV", key: "profile" },
];

export default function Nav({ active }: { active: string }) {
  return (
    <header className="border-b border-gray-100 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-base tracking-tight">AutoApply</span>
        </Link>
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                active === item.key
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              {item.icon === "sparkles" && <Sparkles className="w-3.5 h-3.5" />}
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
