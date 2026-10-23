import type { StickerDesign } from "@/types";

export function getPrintSubjects(design: StickerDesign): string[] {
  const selectedSubjects = design.printSubjects?.map(subject => subject.trim()).filter(Boolean) ?? [];
  if (selectedSubjects.length) return selectedSubjects;

  const subjectText = design.texts.find(text => text.field === "subject")?.text.trim() ?? "";
  if (!subjectText) return [""];
  return subjectText.split(/\s+•\s+/).map(subject => subject.trim()).filter(Boolean);
}

export function getPrintStickerCount(copiesPerSubject: number, subjects: string[]): number {
  if (!Number.isInteger(copiesPerSubject) || copiesPerSubject < 1 || subjects.length < 1) {
    throw new RangeError("Copies per subject and the subject list must not be empty.");
  }
  return copiesPerSubject * subjects.length;
}

export function createPrintSticker(design: StickerDesign, subject: string): StickerDesign {
  return {
    ...design,
    texts: design.texts.map(text => text.field === "subject"
      ? {
        ...text,
        text: subject,
        visible: Boolean(subject),
        fontSize: design.printSubjects?.length ? Math.max(text.fontSize, subject.length > 25 ? 9 : 12) : text.fontSize
      }
      : text),
    printSubjects: undefined
  };
}

export function getPrintSubjectIndex(stickerIndex: number, subjectCount: number): number {
  if (!Number.isInteger(stickerIndex) || stickerIndex < 0 || !Number.isInteger(subjectCount) || subjectCount < 1) {
    throw new RangeError("Sticker index and subject count must be valid positive values.");
  }
  return stickerIndex % subjectCount;
}
