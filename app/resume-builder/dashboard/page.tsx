"use client";

import { useResumeStore } from "@/lib/store/useResumeStore";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Copy, Trash2, Edit3, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

export default function ResumeDashboard() {
  const { resumes, createResume, deleteResume, duplicateResume, setActiveResume } = useResumeStore();
  const router = useRouter();

  const handleCreate = () => {
    const id = createResume();
    router.push(`/resume-builder?id=${id}`);
  };

  const handleEdit = (id: string) => {
    setActiveResume(id);
    router.push(`/resume-builder?id=${id}`);
  };

  const resumeList = Object.values(resumes).sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div className="min-h-screen bg-gray-50/50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Your Resumes</h1>
            <p className="text-gray-500 mt-2 text-lg">Create, edit and manage your professional resumes.</p>
          </div>
          <Button 
            onClick={handleCreate}
            size="lg"
            className="rounded-full px-8 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all hover:scale-105 active:scale-95 flex gap-2"
          >
            <Plus className="w-5 h-5" />
            Create New Resume
          </Button>
        </div>

        {resumeList.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-20 text-center shadow-sm">
            <div className="bg-blue-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-blue-500" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">No resumes yet</h2>
            <p className="text-gray-500 mt-2 max-w-sm mx-auto">
              Get started by creating your first professional resume with our easy-to-use builder.
            </p>
            <Button onClick={handleCreate} variant="outline" className="mt-8 rounded-full px-8">
              Create My First Resume
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resumeList.map((resume) => (
              <div 
                key={resume.id} 
                className="group bg-white rounded-3xl border border-gray-100 p-6 transition-all hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 relative"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-2xl group-hover:scale-110 transition-transform">
                    <FileText className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full hover:bg-gray-100 text-gray-400 hover:text-blue-600"
                      onClick={() => duplicateResume(resume.id)}
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500"
                      onClick={() => deleteResume(resume.id)}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                  {resume.title || "Untitled Resume"}
                </h3>
                <p className="text-sm text-gray-400 flex items-center gap-2 mb-6">
                  Last edited {format(new Date(resume.updatedAt), "MMM d, yyyy")}
                </p>

                <div className="flex gap-3">
                  <Button 
                    onClick={() => handleEdit(resume.id)}
                    className="flex-1 rounded-2xl bg-gray-900 hover:bg-gray-800 text-white flex gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Resume
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-2xl border-gray-200 hover:border-blue-200 hover:bg-blue-50 text-gray-400 hover:text-blue-600"
                    asChild
                  >
                    <Link href={`/resume-builder?id=${resume.id}`} target="_blank">
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
