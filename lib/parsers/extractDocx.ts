// extractDocx.ts
// Extracts raw text from .docx files using mammoth.
// Runs in the browser — mammoth has no webpack issues.
// Install: npm install mammoth

export async function extractTextFromDocx(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value || "";
}