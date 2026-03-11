"use client";

import Link from "next/link";
import { FileText, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-base tracking-tight">AutoApply</span>
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              href="/generate"
              className="px-3.5 py-2 text-sm font-medium rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Generate
            </Link>
            <Link
              href="/profile"
              className="px-3.5 py-2 text-sm font-medium rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
            >
              My CV
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold mb-8 tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            FREE RESUME BUILDER
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-6">
            Build a resume that<br />
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              gets you noticed
            </span>
          </h1>

          <p className="text-lg text-gray-500 max-w-lg mx-auto leading-relaxed mb-10">
            Pick from 7 professional templates, fill in your details, and export as PDF. No sign-up. Your data stays in your browser.
          </p>

          <Link
            href="/resume-builder"
            className="inline-flex items-center gap-2.5 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold rounded-2xl shadow-xl shadow-blue-200 transition-all hover:shadow-2xl hover:shadow-blue-300 active:scale-[0.98]"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </Link>

          {/* Feature bullets */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 mt-12 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              7 templates
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Export to PDF
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              100% free
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              No sign-up
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs text-gray-400">
            AutoApply — Your data stays in your browser. Nothing is sent to any server.
          </p>
        </div>
      </footer>
    </div>
  );
}
