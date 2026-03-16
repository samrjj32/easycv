// app/api/extract-pdf/route.ts
// Uses pdf2json — pure Node.js, zero pdfjs dependency, zero webpack issues.

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Max 10 MB." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const PDFParser = (await import("pdf2json")).default;
    const text = await new Promise<string>((resolve, reject) => {
      const parser = new PDFParser(null, true);

      parser.on("pdfParser_dataReady", () => {
        const raw: string = (parser as unknown as { getRawTextContent: () => string }).getRawTextContent();

        // Safe decode — replaces %XX tokens one by one, never throws on malformed sequences
        const cleaned = raw
          .replace(/%([0-9A-Fa-f]{2})/g, (_, hex) => {
            try {
              return decodeURIComponent(`%${hex}`);
            } catch {
              return `%${hex}`; // keep as-is if malformed
            }
          })
          .replace(/\r\n/g, "\n")
          .replace(/\n{3,}/g, "\n\n")
          .trim();

        resolve(cleaned);
      });

      parser.on("pdfParser_dataError", (errMsg: Error | { parserError: Error }) => {
        if (errMsg instanceof Error) {
          reject(errMsg);
        } else {
          reject(errMsg.parserError);
        }
      });

      parser.parseBuffer(buffer);
    });

    if (!text || text.trim().length < 20) {
      return NextResponse.json(
        { error: "Couldn't extract text from this PDF. It may be a scanned/image PDF. Try a .docx file instead." },
        { status: 422 }
      );
    }

    return NextResponse.json({ text });

  } catch (err) {
    console.error("PDF extract error:", err);
    return NextResponse.json(
      { error: "Failed to read PDF. Try a .docx file instead." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
}