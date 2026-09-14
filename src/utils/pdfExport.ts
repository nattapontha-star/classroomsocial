import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface PdfExportOptions {
  filename?: string;
  orientation?: 'portrait' | 'landscape';
  scale?: number;
  marginMm?: number;
}

/**
 * Resolves modern color functions like oklab/oklch to standard rgb/hex colors
 * so html2canvas doesn't fail with "unsupported color function oklab".
 */
function convertColorToRgb(colorStr: string): string {
  if (!colorStr) return colorStr;
  if (!colorStr.includes('oklab') && !colorStr.includes('oklch')) {
    return colorStr;
  }
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#000000';
      ctx.fillStyle = colorStr;
      const res = ctx.fillStyle;
      if (res && !res.includes('oklab') && !res.includes('oklch')) {
        return res;
      }
    }
  } catch {
    // fallback
  }
  return '#00173b';
}

function sanitizeCssString(cssText: string): string {
  if (!cssText) return '';
  return cssText
    .replace(/oklab\([^)]+\)/gi, (match) => {
      const converted = convertColorToRgb(match);
      return converted.includes('oklab') ? '#00173b' : converted;
    })
    .replace(/oklch\([^)]+\)/gi, (match) => {
      const converted = convertColorToRgb(match);
      return converted.includes('oklch') ? '#00173b' : converted;
    });
}

/**
 * Captures an HTML element and triggers a direct PDF download on the client's device.
 */
export async function downloadElementAsPdf(
  element: HTMLElement,
  options: PdfExportOptions = {}
): Promise<boolean> {
  const {
    filename = 'satit_report.pdf',
    orientation = 'portrait',
    scale = 2,
    marginMm = 8,
  } = options;

  try {
    // Hide any elements with class 'no-print' during canvas rendering
    const noPrintElements = element.querySelectorAll<HTMLElement>('.no-print');
    const originalDisplays: string[] = [];
    noPrintElements.forEach((el, index) => {
      originalDisplays[index] = el.style.display;
      el.style.display = 'none';
    });

    // Capture the element to canvas with onclone sanitization for Tailwind v4 oklab/oklch
    const canvas = await html2canvas(element, {
      scale: scale,
      useCORS: true,
      allowTaint: false,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth || 800,
      onclone: (clonedDoc: Document) => {
        // Sanitize all style tags inside cloned doc
        const styleTags = clonedDoc.querySelectorAll('style');
        styleTags.forEach((styleTag) => {
          if (
            styleTag.textContent &&
            (styleTag.textContent.includes('oklab') || styleTag.textContent.includes('oklch'))
          ) {
            styleTag.textContent = sanitizeCssString(styleTag.textContent);
          }
        });

        // Sanitize inline style attributes on all elements
        const allElements = clonedDoc.querySelectorAll<HTMLElement>('*');
        allElements.forEach((el) => {
          const styleAttr = el.getAttribute('style');
          if (styleAttr && (styleAttr.includes('oklab') || styleAttr.includes('oklch'))) {
            el.setAttribute('style', sanitizeCssString(styleAttr));
          }
        });
      },
    });

    // Restore hidden elements
    noPrintElements.forEach((el, index) => {
      el.style.display = originalDisplays[index] || '';
    });

    // Create jsPDF document
    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = orientation === 'portrait' ? 210 : 297;
    const pageHeight = orientation === 'portrait' ? 297 : 210;

    const contentWidth = pageWidth - marginMm * 2;
    const contentHeight = (canvas.height * contentWidth) / canvas.width;

    const imgData = canvas.toDataURL('image/png', 0.95);

    let heightLeft = contentHeight;
    let position = marginMm;

    // First page
    pdf.addImage(imgData, 'PNG', marginMm, position, contentWidth, contentHeight, '', 'FAST');
    heightLeft -= (pageHeight - marginMm * 2);

    // Multi-page handling if document exceeds 1 page
    while (heightLeft > 0) {
      position = heightLeft - contentHeight + marginMm;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', marginMm, position, contentWidth, contentHeight, '', 'FAST');
      heightLeft -= (pageHeight - marginMm * 2);
    }

    // Save & Trigger download
    const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    pdf.save(cleanFilename);
    return true;
  } catch (error) {
    console.error('Error generating and downloading PDF:', error);
    // Fallback: if canvas fail, notify or trigger window.print
    return false;
  }
}

/**
 * Helper to download by element ID
 */
export async function downloadElementByIdAsPdf(
  elementId: string,
  options: PdfExportOptions = {}
): Promise<boolean> {
  const el = document.getElementById(elementId);
  if (!el) {
    console.warn(`Element with id "${elementId}" not found for PDF export.`);
    return false;
  }
  return downloadElementAsPdf(el, options);
}
