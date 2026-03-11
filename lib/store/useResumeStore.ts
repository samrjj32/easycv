import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ResumeData, BasicInfo, Education, Experience, Project, GlobalSettings, Skill } from "../types/resume";
import { generateUUID } from "../utils";

interface ResumeStore {
  resumes: Record<string, ResumeData>;
  activeResumeId: string | null;
  activeResume: ResumeData | null;

  // Global Actions
  createResume: (templateId?: string | null) => string;
  updateResume: (resumeId: string, data: Partial<ResumeData>) => void;
  deleteResume: (resumeId: string) => void;
  setActiveResume: (resumeId: string) => void;
  duplicateResume: (resumeId: string) => string;

  // Active Resume Actions
  updateBasicInfo: (data: Partial<BasicInfo>) => void;
  addExperience: (experience: Omit<Experience, "id">) => void;
  updateExperience: (id: string, data: Partial<Experience>) => void;
  removeExperience: (id: string) => void;
  addEducation: (education: Omit<Education, "id">) => void;
  updateEducation: (id: string, data: Partial<Education>) => void;
  removeEducation: (id: string) => void;
  addProject: (project: Omit<Project, "id">) => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  removeProject: (id: string) => void;
  addSkill: (skill: Omit<Skill, "id">) => void;
  updateSkill: (id: string, data: Partial<Skill>) => void;
  removeSkill: (id: string) => void;
  updateSkillContent: (content: string) => void;
  updateSummaryContent: (content: string) => void;
  updateGlobalSettings: (settings: Partial<GlobalSettings>) => void;
  setThemeColor: (color: string) => void;
  setTemplate: (templateId: string) => void;
  toggleSectionVisibility: (sectionId: string) => void;
  reorderSections: (newSections: ResumeData["menuSections"]) => void;
  setActiveSection: (sectionId: string) => void;
}

const initialResume: ResumeData = {
  id: "default",
  title: "My Resume",
  templateId: "modern",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  basic: {
    name: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    birthDate: "",
    photo: "",
    employementStatus: "",
    icons: {},
    photoConfig: {
      width: 100,
      height: 100,
      aspectRatio: "1:1",
      borderRadius: "full",
      customBorderRadius: 0,
      visible: true
    },
    customFields: [],
    githubKey: "",
    githubUseName: "",
    githubContributionsVisible: false,
  },
  experience: [],
  education: [],
  projects: [],
  skills: [],
  customData: {},
  skillContent: "",
  summaryContent: "",
  activeSection: "basic",
  draggingProjectId: null,
  menuSections: [
    { id: "basic", title: "Profile", icon: "👤", enabled: true, order: 0 },
    { id: "summary", title: "Summary", icon: "📝", enabled: true, order: 1 },
    { id: "skills", title: "Skills", icon: "⚡", enabled: true, order: 2 },
    { id: "experience", title: "Experience", icon: "💼", enabled: true, order: 3 },
    { id: "education", title: "Education", icon: "🎓", enabled: true, order: 4 },
    { id: "projects", title: "Projects", icon: "🚀", enabled: true, order: 5 },
  ],
  globalSettings: {
    themeColor: "#000000",
    fontFamily: "Inter",
    baseFontSize: 16,
    pagePadding: 40,
    sectionSpacing: 24,
    paragraphSpacing: 12,
    lineHeight: 1.5,
  }
};

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set, get) => ({
      resumes: { "default": initialResume },
      activeResumeId: "default",
      activeResume: initialResume,

      createResume: (templateId = null) => {
        const id = generateUUID();
        const newResume: ResumeData = {
          ...initialResume,
          id,
          title: `New Resume ${id.slice(0, 4)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          templateId,
        };
        set((state) => ({
          resumes: { ...state.resumes, [id]: newResume },
          activeResume: newResume,
          activeResumeId: id,
        }));
        return id;
      },

      updateResume: (resumeId, data) => {
        set((state) => {
          const currentResume = state.resumes[resumeId];
          if (!currentResume) return state;
          const updatedResume = { ...currentResume, ...data, updatedAt: new Date().toISOString() };
          return {
            resumes: { ...state.resumes, [resumeId]: updatedResume },
            activeResume: state.activeResumeId === resumeId ? updatedResume : state.activeResume,
          };
        });
      },

      deleteResume: (resumeId) => {
        set((state) => {
          const { [resumeId]: deleted, ...rest } = state.resumes;
          const remainingIds = Object.keys(rest);
          const nextId = remainingIds.length > 0 ? remainingIds[0] : null;
          return {
            resumes: rest,
            activeResumeId: nextId,
            activeResume: nextId ? rest[nextId] : null,
          };
        });
      },

      setActiveResume: (resumeId) => {
        set((state) => ({
          activeResumeId: resumeId,
          activeResume: state.resumes[resumeId] || null,
        }));
      },

      duplicateResume: (resumeId) => {
        const id = generateUUID();
        const original = get().resumes[resumeId];
        if (!original) return "";
        const duplicated = {
          ...original,
          id,
          title: `${original.title} (Copy)`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          resumes: { ...state.resumes, [id]: duplicated },
          activeResume: duplicated,
          activeResumeId: id,
        }));
        return id;
      },

      updateBasicInfo: (data) => {
        const { activeResumeId } = get();
        if (!activeResumeId) return;
        get().updateResume(activeResumeId, {
          basic: { ...get().activeResume!.basic, ...data }
        });
      },

      addExperience: (exp) => {
        const { activeResumeId, activeResume } = get();
        if (!activeResumeId || !activeResume) return;
        get().updateResume(activeResumeId, {
          experience: [...activeResume.experience, { ...exp, id: generateUUID() }]
        });
      },

      updateExperience: (id, data) => {
        const { activeResumeId, activeResume } = get();
        if (!activeResumeId || !activeResume) return;
        get().updateResume(activeResumeId, {
          experience: activeResume.experience.map(exp => exp.id === id ? { ...exp, ...data } : exp)
        });
      },

      removeExperience: (id) => {
        const { activeResumeId, activeResume } = get();
        if (!activeResumeId || !activeResume) return;
        get().updateResume(activeResumeId, {
          experience: activeResume.experience.filter(exp => exp.id !== id)
        });
      },

      addEducation: (edu) => {
        const { activeResumeId, activeResume } = get();
        if (!activeResumeId || !activeResume) return;
        get().updateResume(activeResumeId, {
          education: [...activeResume.education, { ...edu, id: generateUUID() }]
        });
      },

      updateEducation: (id, data) => {
        const { activeResumeId, activeResume } = get();
        if (!activeResumeId || !activeResume) return;
        get().updateResume(activeResumeId, {
          education: activeResume.education.map(edu => edu.id === id ? { ...edu, ...data } : edu)
        });
      },

      removeEducation: (id) => {
        const { activeResumeId, activeResume } = get();
        if (!activeResumeId || !activeResume) return;
        get().updateResume(activeResumeId, {
          education: activeResume.education.filter(edu => edu.id !== id)
        });
      },

      addProject: (project) => {
        const { activeResumeId, activeResume } = get();
        if (!activeResumeId || !activeResume) return;
        get().updateResume(activeResumeId, {
          projects: [...activeResume.projects, { ...project, id: generateUUID() }]
        });
      },

      updateProject: (id, data) => {
        const { activeResumeId, activeResume } = get();
        if (!activeResumeId || !activeResume) return;
        get().updateResume(activeResumeId, {
          projects: activeResume.projects.map(p => p.id === id ? { ...p, ...data } : p)
        });
      },

      removeProject: (id) => {
        const { activeResumeId, activeResume } = get();
        if (!activeResumeId || !activeResume) return;
        get().updateResume(activeResumeId, {
          projects: activeResume.projects.filter(p => p.id !== id)
        });
      },

      addSkill: (skill) => {
        const { activeResumeId, activeResume } = get();
        if (!activeResumeId || !activeResume) return;
        get().updateResume(activeResumeId, {
          skills: [...activeResume.skills, { ...skill, id: generateUUID() }]
        });
      },

      updateSkill: (id, data) => {
        const { activeResumeId, activeResume } = get();
        if (!activeResumeId || !activeResume) return;
        get().updateResume(activeResumeId, {
          skills: activeResume.skills.map(skill => skill.id === id ? { ...skill, ...data } : skill)
        });
      },

      removeSkill: (id) => {
        const { activeResumeId, activeResume } = get();
        if (!activeResumeId || !activeResume) return;
        get().updateResume(activeResumeId, {
          skills: activeResume.skills.filter(skill => skill.id !== id)
        });
      },

      updateSkillContent: (content) => {
        const { activeResumeId } = get();
        if (!activeResumeId) return;
        get().updateResume(activeResumeId, { skillContent: content });
      },

      updateSummaryContent: (content) => {
        const { activeResumeId } = get();
        if (!activeResumeId) return;
        get().updateResume(activeResumeId, { summaryContent: content });
      },

      updateGlobalSettings: (settings) => {
        const { activeResumeId, activeResume } = get();
        if (!activeResumeId || !activeResume) return;
        get().updateResume(activeResumeId, {
          globalSettings: { ...activeResume.globalSettings, ...settings }
        });
      },

      setThemeColor: (color) => {
        const { activeResumeId, activeResume } = get();
        if (!activeResumeId || !activeResume) return;
        get().updateResume(activeResumeId, {
          globalSettings: { ...activeResume.globalSettings, themeColor: color }
        });
      },

      setTemplate: (templateId) => {
        const { activeResumeId } = get();
        if (!activeResumeId) return;
        get().updateResume(activeResumeId, { templateId });
      },

      toggleSectionVisibility: (sectionId) => {
        const { activeResumeId, activeResume } = get();
        if (!activeResumeId || !activeResume) return;
        get().updateResume(activeResumeId, {
          menuSections: activeResume.menuSections.map(s => 
            s.id === sectionId ? { ...s, enabled: !s.enabled } : s
          )
        });
      },

      reorderSections: (newSections) => {
        const { activeResumeId } = get();
        if (!activeResumeId) return;
        get().updateResume(activeResumeId, { menuSections: newSections });
      },

      setActiveSection: (sectionId) => {
        const { activeResumeId } = get();
        if (!activeResumeId) return;
        get().updateResume(activeResumeId, { activeSection: sectionId });
      },
    }),
    {
      name: "resume-builder-storage",
    }
  )
);
