// extractPdf.ts
// Sends PDF to our own API route — pdf2json handles it server-side.
// Clean, no CDN loading, no webpack issues.

export async function extractTextFromPdf(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/extract-pdf", {
    method: "POST",
    body: formData,
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error || "PDF extraction failed");
  }

  return json.text || "";
}