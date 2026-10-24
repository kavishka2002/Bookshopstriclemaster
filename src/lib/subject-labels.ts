import { subjectPresets } from "../data/templates";

const sinhalaSubjectNames: Record<string, string> = {
  "ගණිතය": "Mathematics",
  "ඉංග්‍රීසි": "English",
  "සිංහල": "Sinhala",
  "දෙමළ": "Tamil",
  "පරිසරය": "Environmental Studies",
  "ආගම": "Religion",
  "චිත්‍ර": "Art",
  "සෞඛ්‍ය හා ශාරීරික අධ්‍යාපනය": "Health & Physical Education",
  "විද්‍යාව": "Science",
  "ඉතිහාසය": "History",
  "භූගෝල විද්‍යාව": "Geography",
  "තොරතුරු හා සන්නිවේදන තාක්ෂණය": "Information & Communication Technology",
  "වාණිජ්‍යය": "Commerce",
  "ජීව විද්‍යාව": "Biology",
  "භෞතික විද්‍යාව": "Physics",
  "රසායන විද්‍යාව": "Chemistry",
  "සංයුක්ත ගණිතය": "Combined Mathematics",
  "ආර්ථික විද්‍යාව": "Economics",
  "ගිණුම්කරණය": "Accounting",
  "ව්‍යාපාර අධ්‍යයනය": "Business Studies",
  "ඉංජිනේරු තාක්ෂණවේදය": "Engineering Technology"
};

const normalize = (value: string) => value.normalize("NFC").trim().replace(/\s+/g, " ").toLocaleLowerCase();
const englishSubjectNames = new Map<string, string>();

for (const subject of Object.values(subjectPresets).flat()) {
  const englishName = /[\u0D80-\u0DFF]/.test(subject.en) ? subject.si : subject.en;
  if (!/[\u0D80-\u0DFF]/.test(englishName)) {
    englishSubjectNames.set(normalize(subject.en), englishName);
    englishSubjectNames.set(normalize(subject.si), englishName);
  }
}

for (const [sinhalaName, englishName] of Object.entries(sinhalaSubjectNames)) {
  englishSubjectNames.set(normalize(sinhalaName), englishName);
}

export function englishSubjectName(subject: { en: string; si: string }): string {
  for (const name of [subject.en, subject.si]) {
    const normalized = normalize(name);
    if (!normalized) continue;
    const translated = englishSubjectNames.get(normalized);
    if (translated) return translated;
    if (!/[\u0D80-\u0DFF]/.test(name)) return name.trim();
  }
  return "Custom subject";
}
