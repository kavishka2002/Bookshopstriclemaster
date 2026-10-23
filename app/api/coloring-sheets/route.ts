import { readdir, stat } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { NextResponse } from "next/server";
import { createColoringSheet } from "@/lib/coloring-sheets";

export const dynamic = "force-dynamic";

const assetRoot = join(process.cwd(), "public");
const pdfRoot = join(assetRoot, "පින්තුර", "පින්තුර");

async function collectPdfFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(entries.map(async entry => {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) return collectPdfFiles(fullPath);
    if (entry.isFile() && entry.name.toLowerCase().endsWith(".pdf")) return [fullPath];
    return [];
  }));
  return nestedFiles.flat();
}

export async function GET() {
  try {
    const files = await collectPdfFiles(pdfRoot);
    const sheets = await Promise.all(files.map(async fullPath => {
      const filePath = relative(assetRoot, fullPath).split(sep).join("/");
      const fileStat = await stat(fullPath);
      const url = `/${filePath.split("/").map(encodeURIComponent).join("/")}`;
      return createColoringSheet(filePath, url, fileStat.size);
    }));
    sheets.sort((a, b) => a.sinhalaName.localeCompare(b.sinhalaName, "si"));
    return NextResponse.json({ sheets });
  } catch (cause) {
    console.error("Could not build the colouring sheet catalogue.", cause);
    return NextResponse.json({ error: "The local colouring sheet folder could not be read." }, { status: 500 });
  }
}
