"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadCv } from "@/lib/cvStore";
import Link from "next/link";
import { FileText, Sparkles, ClipboardList } from "lucide-react";

export default function GeneratePage() {
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasCv, setHasCv] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setHasCv(!!loadCv());
  }, []);

  async function handleGenerate() {
    const cv = loadCv();
    if (!cv) { setError("Please save your CV first — go to the My CV tab."); return; }
    if (!jd.trim()) { setError("Please paste a job description."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv, jd }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      sessionStorage.setItem("autoapply_cv_output", data.tailoredCv);
      sessionStorage.setItem("autoapply_cl_output", data.coverLetter);
      router.push("/results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="h-14 border-b border-gray-200 bg-white flex items-center px-6 shadow-sm">
        <div className="max-w-[1300px] w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 mr-2">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900 text-sm tracking-tight">AutoApply</span>
            </Link>
            <div className="w-px h-5 bg-gray-200" />
            <nav className="flex items-center gap-1">
              <Link href="/" className="px-3 py-1.5 text-xs font-medium rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
                Resume Builder
              </Link>
              <Link href="/generate" className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-50 text-blue-700">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  AI Generate
                </span>
              </Link>
              <Link href="/profile" className="px-3 py-1.5 text-xs font-medium rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
                My CV
              </Link>
              <Link href="/results" className="px-3 py-1.5 text-xs font-medium rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
                <span className="flex items-center gap-1.5">
                  <ClipboardList className="w-3 h-3" />
                  Results
                </span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-[900px] mx-auto px-6 py-8">
        {/* CV status bar */}
        <div className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm mb-7 ${
          hasCv ? "bg-green-50 border border-green-200 text-green-700" : "bg-amber-50 border border-amber-200 text-amber-700"
        }`}>
          <span>{hasCv ? "✓" : "⚠"}</span>
          <span>
            {hasCv
              ? "CV loaded — paste a JD below and generate"
              : "No CV found — go to My CV tab and paste your CV first"}
          </span>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm mb-6">
            ⚠ {error}
          </div>
        )}

        <label className="block text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">
          Job Description
        </label>
        <textarea
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          placeholder="Paste the full job description here — title, responsibilities, requirements, company info..."
          className="w-full min-h-[400px] bg-gray-50 border border-gray-200 rounded-xl p-5 text-gray-800 text-sm leading-7 resize-y focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
        />

        <button
          onClick={handleGenerate}
          disabled={loading || !jd.trim()}
          className={`mt-4 px-8 py-3 rounded-xl text-sm font-bold tracking-wide transition-all ${
            loading || !jd.trim()
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 active:scale-95 cursor-pointer"
          }`}
        >
          {loading ? "Generating..." : "⚡ Generate CV + Cover Letter"}
        </button>

        {loading && (
          <div className="flex items-center gap-3 text-blue-600 text-sm mt-5">
            <div className="spinner" />
            <span>Running both AI calls in parallel — usually 10–20 seconds...</span>
          </div>
        )}
      </main>
    </div>
  );
}
