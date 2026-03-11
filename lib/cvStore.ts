export const CV_STORAGE_KEY = "autoapply_master_cv";

export function saveCv(cv: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(CV_STORAGE_KEY, cv);
  }
}

export function loadCv(): string {
  if (typeof window !== "undefined") {
    return localStorage.getItem(CV_STORAGE_KEY) || "";
  }
  return "";
}
