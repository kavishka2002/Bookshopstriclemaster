import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { createOlPaper } from "@/lib/ol-papers";

export const dynamic = "force-dynamic";

const papersRoot = join(process.cwd(), "public", "papers");

export async function GET() {
  try {
    const yearFolders = (await readdir(papersRoot, { withFileTypes: true }))
      .filter(entry => entry.isDirectory() && /^\d{4} ol$/i.test(entry.name));
    const papers = (await Promise.all(yearFolders.map(async folder => {
      const files = await readdir(join(papersRoot, folder.name), { withFileTypes: true });
      return files
        .filter(file => file.isFile() && /\.pdf$/i.test(file.name))
        .sort((left, right) =>
          Number(/\s*\(\d+\)\.pdf$/i.test(left.name)) - Number(/\s*\(\d+\)\.pdf$/i.test(right.name))
          || left.name.localeCompare(right.name)
        )
        .map(file => createOlPaper(folder.name, file.name))
        .filter(paper => paper !== null);
    }))).flat();

    const uniquePapers = new Map<string, typeof papers[number]>();
    for (const paper of papers) {
      const key = `${paper.year}|${paper.subject}|${paper.medium}|${paper.syllabus ?? ""}`;
      if (!uniquePapers.has(key)) uniquePapers.set(key, paper);
    }
    const catalogue = [...uniquePapers.values()];
    catalogue.sort((left, right) =>
      right.year - left.year
      || left.subject.localeCompare(right.subject)
      || left.medium.localeCompare(right.medium)
      || left.fileName.localeCompare(right.fileName)
    );
    return NextResponse.json({ papers: catalogue });
  } catch (cause) {
    console.error("Could not build the O/L past paper catalogue.", cause);
    return NextResponse.json({ error: "The local O/L paper folders could not be read." }, { status: 500 });
  }
}
