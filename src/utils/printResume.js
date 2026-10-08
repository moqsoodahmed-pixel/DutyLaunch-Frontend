/**
 * Prints (or saves as PDF) the single resume sheet on the page — the element
 * marked data-resume-sheet="true" — as an isolated one-page A4 document.
 * Shared by the Resume Builder editor and the guided wizard.
 */
export function printResumeSheet(title) {
  try {
    const sheet = document.querySelector('[data-resume-sheet="true"]');
    if (sheet) {
      let frame = document.getElementById('cv-dedicated-print-frame');
      if (frame) frame.remove();

      frame = document.createElement('iframe');
      frame.id = 'cv-dedicated-print-frame';
      frame.style.position = 'fixed';
      frame.style.right = '0';
      frame.style.bottom = '0';
      frame.style.width = '0';
      frame.style.height = '0';
      frame.style.border = 'none';
      frame.style.visibility = 'hidden';
      document.body.appendChild(frame);

      const frameDoc = frame.contentWindow.document;
      frameDoc.open();
      frameDoc.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${title || 'DutyLaunch_Resume'} - ATS Resume</title>
<style>
  @page {
    size: A4 portrait;
    margin: 0mm !important;
  }
  *, *::before, *::after {
    box-sizing: border-box !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
  }
  html, body {
    margin: 0 !important;
    padding: 0 !important;
    background: #ffffff !important;
    width: 210mm !important;
    /* No fixed height / overflow:hidden here on purpose — a resume longer
       than one page must flow onto a second printed page instead of being
       silently clipped. The old fixed 297mm height + overflow:hidden is
       exactly what cut content off at the bottom of long resumes. */
    font-family: Arial, Helvetica, sans-serif;
  }
  .print-container {
    width: 210mm !important;
    min-height: 297mm !important;
    margin: 0 auto !important;
    padding: 0 !important;
    background: #ffffff !important;
  }
  .print-container > div {
    transform: none !important;
    width: 210mm !important;
    min-height: 297mm !important;
    height: auto !important;
    margin: 0 !important;
  }
</style>
</head>
<body>
<div class="print-container">
  ${sheet.outerHTML}
</div>
</body>
</html>`);
      frameDoc.close();

      let printed = false;
      const triggerPrint = () => {
        if (printed) return;
        printed = true;
        frame.contentWindow.focus();
        frame.contentWindow.print();
      };
      // Wait for fonts to actually finish loading before printing — a flat
      // delay can fire before the real font is ready, which is one of the
      // ways a browser ends up substituting glyphs from a fallback font
      // mid-document. Falls back to a short delay if the Font Loading API
      // isn't available in this context, and a safety-net timeout covers
      // the rare case where 'ready' never resolves.
      const fonts = frameDoc.fonts;
      if (fonts?.ready) {
        fonts.ready.then(triggerPrint).catch(() => setTimeout(triggerPrint, 300));
        setTimeout(triggerPrint, 1500);
      } else {
        setTimeout(triggerPrint, 300);
      }
      return;
    }
  } catch (e) {
    console.warn('Iframe print error, falling back to window.print():', e);
  }
  window.print();
}