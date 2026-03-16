// app/api/export-pdf/route.ts
// Server-side PDF generation using Puppeteer (headless Chrome).
// Produces pixel-perfect output matching the live preview.
//
// Install dependencies:
//   npm install puppeteer-core @sparticuz/chromium-min
//
// For local development only (not needed for Vercel):
//   npm install --save-dev puppeteer

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { content, styles, margin = 0, filename = "resume" } = body;

    if (!content) {
      return NextResponse.json({ error: "No content provided." }, { status: 400 });
    }

    // ── Launch Puppeteer ────────────────────────────────────────────────────
    let browser;

    if (process.env.NODE_ENV === "production" || process.env.USE_CHROMIUM_MIN) {
      // Vercel / AWS Lambda — uses the minimal Chromium bundle
      const chromium = (await import("@sparticuz/chromium-min")).default;
      const puppeteer = (await import("puppeteer-core")).default;

      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: { width: 794, height: 1123 },
        executablePath: await chromium.executablePath(
          // Pin to a specific release so the bundle is cached
          process.env.CHROMIUM_REMOTE_URL ||
          "https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar"
        ),
        headless: true,
      });
    } else {
      // Local development — uses locally installed Chrome / puppeteer
      try {
        // Try puppeteer-core with system Chrome first
        const puppeteer = (await import("puppeteer-core")).default;
        const executablePath =
          process.env.CHROME_EXECUTABLE_PATH ||
          (process.platform === "darwin"
            ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
            : process.platform === "win32"
            ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
            : "/usr/bin/google-chrome-stable");

        browser = await puppeteer.launch({
          executablePath,
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
          defaultViewport: { width: 794, height: 1123 },
          headless: true,
        });
      } catch {
        // Fallback: full puppeteer (if installed as devDependency)
        const puppeteer = (await import("puppeteer" as string)) as typeof import("puppeteer");
        browser = await (puppeteer as any).launch({
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
          defaultViewport: { width: 794, height: 1123 },
          headless: true,
        });
      }
    }

    const page = await browser.newPage();

    // ── Build the HTML document ─────────────────────────────────────────────
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    /* ── Reset ────────────────────────────────── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    @page {
      size: A4;
      margin: 0;
    }

    html, body {
      width: 210mm;
      background: white !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      font-size: 14px;
      line-height: 1.5;
    }

    /* ── Hide builder-only UI chrome ─────────── */
    .page-break-line,
    .page-break-badge,
    .no-print {
      display: none !important;
    }

    /* ── Injected app styles ─────────────────── */
    ${styles || ""}
  </style>
</head>
<body>
  ${content}
</body>
</html>`;

    await page.setContent(html, { waitUntil: "networkidle0", timeout: 30000 });

    // Wait for fonts and layout to settle
    await page.evaluate(() => document.fonts.ready);
    await new Promise(resolve => setTimeout(resolve, 300));

    // ── Generate PDF ────────────────────────────────────────────────────────
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      displayHeaderFooter: false,
    });

    await browser.close();

    // ── Return PDF ──────────────────────────────────────────────────────────
    const safeName = filename.replace(/[^a-z0-9_\-]/gi, "_") || "resume";

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeName}.pdf"`,
        "Content-Length": String(pdfBuffer.length),
      },
    });

  } catch (err: unknown) {
    console.error("PDF export error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `PDF generation failed: ${message}` }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
}