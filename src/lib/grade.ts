import type { LanguageMode } from "@/types";

export function formatGradeForLanguage(value: string, language: LanguageMode): string {
  const number = /(?:grade\s*)?(\d{1,2})/i.exec(value)?.[1];
  if (!number) return value;
  const grade = Number(number);
  if (grade < 1 || grade > 13) return value;
  if (language === "Sinhala") return `${grade} ශ්‍රේණිය`;
  if (language === "Sinhala + English") return `Grade ${grade} / ${grade} ශ්‍රේණිය`;
  return `Grade ${grade}`;
}
