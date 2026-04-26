/**
 * Browser-side text extraction from JD files.
 * - .txt → FileReader
 * - .pdf → pdfjs-dist (lazy)
 * - .docx → mammoth (lazy)
 * - .doc / audio → friendly "not supported" error
 */

const readAsText = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(new Error("Could not read file"));
    r.onload = () => resolve(String(r.result || ""));
    r.readAsText(file);
  });

const readAsArrayBuffer = (file: File): Promise<ArrayBuffer> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(new Error("Could not read file"));
    r.onload = () => resolve(r.result as ArrayBuffer);
    r.readAsArrayBuffer(file);
  });

const extractPdf = async (file: File): Promise<string> => {
  const pdfjs: any = await import("pdfjs-dist");
  // Worker setup — point to the bundled worker via Vite's ?url import
  const workerSrc = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

  const buf = await readAsArrayBuffer(file);
  const doc = await pdfjs.getDocument({ data: buf }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((it: any) => ("str" in it ? it.str : ""));
    pages.push(strings.join(" "));
  }
  return pages.join("\n\n").trim();
};

const extractDocx = async (file: File): Promise<string> => {
  const mammoth: any = await import("mammoth/mammoth.browser");
  const buf = await readAsArrayBuffer(file);
  const result = await mammoth.extractRawText({ arrayBuffer: buf });
  return String(result.value || "").trim();
};

export type ParseResult = {
  text: string;
  source: "pdf" | "docx" | "txt";
};

export const extractTextFromFile = async (file: File): Promise<ParseResult> => {
  const name = file.name.toLowerCase();
  const type = file.type;

  if (name.endsWith(".txt") || type === "text/plain") {
    return { text: (await readAsText(file)).trim(), source: "txt" };
  }
  if (name.endsWith(".pdf") || type === "application/pdf") {
    return { text: await extractPdf(file), source: "pdf" };
  }
  if (
    name.endsWith(".docx") ||
    type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return { text: await extractDocx(file), source: "docx" };
  }
  if (name.endsWith(".doc")) {
    throw new Error(
      "Legacy .doc files aren't supported in the browser. Please save as .docx or PDF, or paste the text instead.",
    );
  }
  if (
    name.endsWith(".mp3") ||
    name.endsWith(".wav") ||
    name.endsWith(".m4a") ||
    type.startsWith("audio/")
  ) {
    throw new Error(
      "Audio transcription isn't enabled yet. Please paste the JD text or upload a PDF/DOCX file.",
    );
  }
  throw new Error(
    `Unsupported file type. Please upload PDF, DOCX, or TXT — or paste the text.`,
  );
};

export const ACCEPT_ATTR =
  ".pdf,.doc,.docx,.txt,.mp3,.wav,.m4a,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,audio/*";
