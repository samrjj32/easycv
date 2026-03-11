"use client";

import { useState, useEffect } from "react";
import { saveCv, loadCv } from "@/lib/cvStore";
import Nav from "@/components/Nav";

export default function ProfilePage() {
  const [cv, setCv] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setCv(loadCv());
  }, []);

  function handleSave() {
    saveCv(cv);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const wordCount = cv.trim() ? cv.trim().split(/\s+/).length : 0;

  return (
    <div className="min-h-screen bg-white">
      <Nav active="profile" />
      <main className="max-w-[900px] mx-auto px-6 py-8">
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-blue-700 text-sm mb-7 leading-relaxed">
          💡 Paste your full CV here once. The app uses this as source material for every
          application — it tailors a new version per JD without touching this master copy.
        </div>

        <label className="block text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">
          Your Master CV
        </label>
        <textarea
          value={cv}
          onChange={(e) => setCv(e.target.value)}
          placeholder="Paste your full CV here — formatting does not matter at all. Work history, skills, education, projects, everything."
          className="w-full min-h-[500px] bg-gray-50 border border-gray-200 rounded-xl p-5 text-gray-800 text-sm leading-7 resize-y focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
        />

        <div className="flex items-center gap-5 mt-4">
          <button
            onClick={handleSave}
            disabled={!cv.trim()}
            className={`px-8 py-3 rounded-xl text-sm font-bold tracking-wide transition-all ${
              !cv.trim()
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : saved
                ? "bg-green-600 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 active:scale-95 cursor-pointer"
            }`}
          >
            {saved ? "✓ Saved" : "Save CV"}
          </button>
          {wordCount > 0 && (
            <span className="text-xs text-gray-400">{wordCount} words loaded</span>
          )}
        </div>
      </main>
    </div>
  );
}
