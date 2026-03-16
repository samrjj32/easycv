// lib/hooks/usePdfExport.ts
// Captures the live CV preview as HTML + CSS, sends it to the server-side
// Puppeteer endpoint, and downloads the resulting PDF.
// This approach mirrors magicv.art — pixel-perfect output on all devices.

import { useCallback, useRef, useState } from "react";

interface UsePdfExportOptions {
  filename?: string;
}

interface UsePdfExportReturn {
  exportRef: React.RefObject<HTMLDivElement>;
  handleExport: () => Promise<void>;
  isExporting: boolean;
}

// ── CSS helpers ──────────────────────────────────────────────────────────────

/** Collect all non-font, non-animation styles from the document */
function captureStyles(): string {
  const seen = new Set<string>();
  const chunks: string[] = [];

  // Resolve all CSS custom properties (--accent, --bg, etc.) from :root
  // and inject them inline so the isolated HTML renders correctly.
  const rootStyles = getComputedStyle(document.documentElement);
  const cssVarBlock: string[] = [":root {"];
  for (let i = 0; i < rootStyles.length; i++) {
    const prop = rootStyles[i];
    if (prop.startsWith("--")) {
      cssVarBlock.push(`  ${prop}: ${rootStyles.getPropertyValue(prop).trim()};`);
    }
  }
  cssVarBlock.push("}");
  chunks.push(cssVarBlock.join("\n"));

  // Walk all stylesheets and copy rules (skip fonts / animations / external)
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      for (const rule of Array.from(sheet.cssRules)) {
        const text = rule.cssText;
        const lower = text.toLowerCase();

        if (seen.has(text)) continue;
        seen.add(text);

        if (rule instanceof CSSFontFaceRule) continue;
        if (rule instanceof CSSImportRule) continue;
        if (lower.includes("fonts.googleapis.com")) continue;
        if (lower.includes("fonts.gstatic.com")) continue;
        if (lower.includes("@keyframes")) continue;
        if (lower.includes("animation:") || lower.includes("animation-")) continue;
        if (lower.includes("transition:") || lower.includes("transition-")) continue;

        chunks.push(text);
      }
    } catch {
      // Cross-origin stylesheets throw — skip silently
    }
  }

  return chunks.join("\n");
}

/** Convert any external <img> src values to base64 data URIs */
async function inlineImages(element: HTMLElement): Promise<void> {
  const imgs = Array.from(element.getElementsByTagName("img")).filter(
    img => img.src && !img.src.startsWith("data:")
  );

  await Promise.all(
    imgs.map(img =>
      fetch(img.src)
        .then(r => r.blob())
        .then(
          blob =>
            new Promise<void>(resolve => {
              const reader = new FileReader();
              reader.onloadend = () => {
                img.src = reader.result as string;
                resolve();
              };
              reader.readAsDataURL(blob);
            })
        )
        .catch(() => {})
    )
  );
}

/** Clone the element and strip out builder-only UI */
function prepareClone(el: HTMLElement): HTMLElement {
  const clone = el.cloneNode(true) as HTMLElement;

  // Remove the CSS scale() transform — server renders at native 794 px width
  const transform = clone.style.transform || "";
  const scaleMatch = transform.match(/scale\(([\d.]+)\)/);
  if (scaleMatch) {
    const s = Number(scaleMatch[1]);
    if (Number.isFinite(s) && s > 0) {
      clone.style.removeProperty("transform");
      clone.style.removeProperty("transform-origin");
    }
  }

  // Force full width so the server sees 794 px content
  clone.style.setProperty("width", "794px", "important");
  clone.style.removeProperty("max-width");

  // Hide page-break indicator badges (builder-only UI)
  clone.querySelectorAll<HTMLElement>(
    ".page-break-line, .page-break-badge, .no-print"
  ).forEach(el => (el.style.display = "none"));

  return clone;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function usePdfExport({ filename = "resume" }: UsePdfExportOptions = {}): UsePdfExportReturn {
  const exportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async () => {
    const element = exportRef.current;
    if (!element) {
      console.error("usePdfExport: exportRef is not attached to a DOM element.");
      return;
    }

    setIsExporting(true);

    try {
      // 1. Prepare a clean clone of the CV HTML
      const clone = prepareClone(element);

      // 2. Convert external images to base64 (avoids CORS on the server)
      await inlineImages(clone);

      // 3. Capture all styles including resolved CSS custom properties
      const styles = captureStyles();

      // 4. Send to the server-side Puppeteer endpoint
      const response = await fetch("/api/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: clone.outerHTML,
          styles,
          filename,
        }),
        signal: AbortSignal.timeout(60_000),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || `Server error ${response.status}`);
      }

      // 5. Download the PDF
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error("PDF export failed:", err);

      // ── Fallback: html2pdf.js client-side if the server is unavailable ──
      console.warn("Falling back to html2pdf.js client-side export.");
      try {
        const html2pdf = (await import("html2pdf.js")).default;
        await html2pdf()
          .set({
            margin: 0,
            filename: `${filename}.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, scrollX: 0, scrollY: -window.scrollY },
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
            pagebreak: { mode: ["avoid-all", "css", "legacy"] },
          })
          .from(exportRef.current!)
          .save();
      } catch (fallbackErr) {
        console.error("Fallback export also failed:", fallbackErr);
        alert("PDF export failed. Please try again or use Ctrl+P / Cmd+P to print.");
      }
    } finally {
      setIsExporting(false);
    }
  }, [filename]);

  return { exportRef, handleExport, isExporting };
}