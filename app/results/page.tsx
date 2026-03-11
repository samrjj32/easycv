"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={handleCopy}
      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
        copied
          ? "bg-green-600 text-white border-green-600"
          : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700"
      }`}
    >
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

export default function ResultsPage() {
  const [cvOutput, setCvOutput] = useState("");
  const [clOutput, setClOutput] = useState("");
  const router = useRouter();

  useEffect(() => {
    const cv = sessionStorage.getItem("autoapply_cv_output") || "";
    const cl = sessionStorage.getItem("autoapply_cl_output") || "";
    if (!cv && !cl) {
      router.push("/");
    } else {
      setCvOutput(cv);
      setClOutput(cl);
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-white">
      <Nav active="results" />
      <main className="max-w-[1300px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CV Output */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <span className="text-xs text-blue-600 uppercase tracking-wider font-bold">
                📋 Tailored CV
              </span>
              <CopyButton text={cvOutput} />
            </div>
            <div className="p-5 whitespace-pre-wrap text-sm leading-7 text-gray-600 max-h-[680px] overflow-y-auto">
              {cvOutput}
            </div>
          </div>

          {/* Cover Letter Output */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <span className="text-xs text-blue-600 uppercase tracking-wider font-bold">
                ✉ Cover Letter
              </span>
              <CopyButton text={clOutput} />
            </div>
            <div className="p-5 whitespace-pre-wrap text-sm leading-7 text-gray-600 max-h-[680px] overflow-y-auto">
              {clOutput}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 text-sm hover:bg-gray-100 hover:text-gray-700 transition-all cursor-pointer"
          >
            ↩ New Application
          </button>
        </div>
      </main>
    </div>
  );
}
