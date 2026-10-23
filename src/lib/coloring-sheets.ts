export type ColoringCategory =
  | "Animals"
  | "Birds"
  | "Flowers"
  | "Fruits"
  | "Vehicles"
  | "Food & plants"
  | "Letters & numbers"
  | "Sports"
  | "Cartoons & characters"
  | "Nature"
  | "People & places"
  | "Other";

export type ColoringSheet = {
  id: string;
  sinhalaName: string;
  englishName: string;
  keywords: string[];
  category: ColoringCategory;
  url: string;
  sizeBytes: number;
};

const categoryRules: Array<{ category: ColoringCategory; names: string[]; terms: string[] }> = [
  { category: "Flowers", names: ["Flowers", "මල්"], terms: ["මල්", "මල", "පැලෑටි", "flower", "blossom"] },
  { category: "Animals", names: ["Animals", "සතුන්"], terms: ["සතුන්", "සත්ව", "සතෙකු", "බල්ලා", "බල්ල", "බළලා", "බළල", "සිවුපා", "animals", "animal", "dog", "dogs", "puppy", "cat", "cats", "pet"] },
  { category: "Birds", names: ["Birds", "කුරුල්ලන්"], terms: ["කුරුල්ල", "කුරුළු", "පක්ෂී", "bird", "birds"] },
  { category: "Fruits", names: ["Fruits", "පලතුරු"], terms: ["පලතුරු", "පළතුරු", "fruit", "fruits"] },
  { category: "Vehicles", names: ["Vehicles", "වාහන"], terms: ["වාහන", "ගමනාගමන", "යාන", "ප්‍රවාහන", "ප්_රවාහන", "vehicle", "vehicles", "transport", "car", "cars", "bus", "train", "plane"] },
  { category: "Food & plants", names: ["Food & plants", "ආහාර සහ ශාක"], terms: ["ආහාර", "එළව", "එලව", "බෝග", "කුළුබඩු", "food", "foods", "vegetable", "vegetables", "plant", "plants", "crop"] },
  { category: "Letters & numbers", names: ["Letters & numbers", "අකුරු සහ ඉලක්කම්"], terms: ["අකුරු", "හෝඩිය", "ඉලක්කම්", "letters", "alphabet", "numbers", "numerals"] },
  { category: "Sports", names: ["Sports", "ක්‍රීඩා"], terms: ["ක්_රීඩා", "ක්‍රීඩා", "ක්_රීඩක", "sports", "sport", "player", "players"] },
  { category: "Cartoons & characters", names: ["Cartoons & characters", "කාටූන් සහ චරිත"], terms: ["කාටූන්", "cartoon", "cartoons", "character", "characters"] },
  { category: "People & places", names: ["People & places", "මිනිසුන් සහ ස්ථාන"], terms: ["පවුල", "පුද්ගල", "පාසල", "පාසල්", "නිවස", "ස්ථාන", "ස්තාන", "people", "family", "school", "home", "places"] },
  { category: "Nature", names: ["Nature", "සොබාදහම"], terms: ["ශාක", "ගස", "ගස්", "පරිසර", "අහස", "ගංගා", "කදු", "කඳු", "nature", "tree", "trees", "environment", "landscape"] }
];

const querySynonyms: Record<string, string[]> = {
  flower: ["flowers", "blossom", "මල්", "මල"],
  flowers: ["flower", "blossom", "මල්", "මල"],
  මල: ["මල්", "flower", "flowers"],
  මල්: ["මල", "flower", "flowers"],
  dog: ["dogs", "puppy", "animal", "animals", "බල්ලා", "බල්ලෝ", "සතුන්"],
  dogs: ["dog", "puppy", "animal", "animals", "බල්ලා", "බල්ලෝ", "සතුන්"],
  බල්ලා: ["බල්ලෝ", "dog", "dogs", "animal", "animals", "සතුන්"],
  බල්ලෝ: ["බල්ලා", "dog", "dogs", "animal", "animals", "සතුන්"],
  cat: ["cats", "animal", "animals", "බළලා", "සතුන්"],
  cats: ["cat", "animal", "animals", "බළලා", "සතුන්"],
  bird: ["birds", "කුරුල්ලෝ", "කුරුල්ලන්"],
  birds: ["bird", "කුරුල්ලෝ", "කුරුල්ලන්"],
  fruit: ["fruits", "පලතුරු", "පළතුරු"],
  fruits: ["fruit", "පලතුරු", "පළතුරු"],
  vehicle: ["vehicles", "transport", "වාහන"],
  vehicles: ["vehicle", "transport", "වාහන"],
  transport: ["vehicle", "vehicles", "වාහන", "ගමනාගමනය"],
  animals: ["animal", "dog", "dogs", "cat", "cats", "සතුන්", "සත්ව"],
  animal: ["animals", "dog", "dogs", "cat", "cats", "සතුන්", "සත්ව"]
};

const metadataOverrides: Record<string, { englishName: string; keywords?: string[] }> = {
  "මල්.pdf": { englishName: "Flowers", keywords: ["flower", "flowers", "blossom", "මල"] },
  "මල් වර්ග.pdf": { englishName: "Types of flowers", keywords: ["flower", "flowers", "blossom", "මල"] },
  "මල් වර්ගයන්.pdf": { englishName: "Types of flowers", keywords: ["flower", "flowers", "blossom", "මල"] },
  "අවුරුද්දට වරක් පිපින මල්.pdf": { englishName: "Flowers that bloom once a year", keywords: ["flower", "flowers", "blossom", "මල"] },
  "විවිධ සතුන්.pdf": { englishName: "Different animals", keywords: ["animal", "animals", "dog", "dogs", "cat", "cats", "සතෙකු"] },
  "පළතුරු.pdf": { englishName: "Fruits", keywords: ["fruit", "fruits", "පලතුරු"] },
  "පළතුරු වර්ග.pdf": { englishName: "Types of fruits", keywords: ["fruit", "fruits", "පලතුරු"] },
  "එළවළු.pdf": { englishName: "Vegetables", keywords: ["vegetable", "vegetables", "එළවලු"] },
  "එළවලු.pdf": { englishName: "Vegetables", keywords: ["vegetable", "vegetables", "එළවළු"] },
  "ලෝකයේ විවිධ වාහන.pdf": { englishName: "Different vehicles around the world", keywords: ["vehicle", "vehicles", "transport", "car", "bus", "train", "plane"] }
};

function searchable(value: string): string {
  return value
    .normalize("NFC")
    .toLocaleLowerCase()
    .replace(/[_\u200b-\u200f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function createColoringSheet(filePath: string, url: string, sizeBytes: number): ColoringSheet {
  const filename = filePath.split("/").at(-1) ?? filePath;
  const sinhalaName = filename.replace(/\.pdf$/i, "").replace(/_/g, "\u200d").trim();
  const normalizedName = searchable(sinhalaName);
  const rule = categoryRules.find(candidate => candidate.terms.some(term => normalizedName.includes(searchable(term))));
  const category = rule?.category ?? "Other";
  const override = metadataOverrides[filename];
  const englishName = override?.englishName ?? rule?.names[0] ?? "Learning sheet";
  const keywords = [...new Set([sinhalaName, englishName, ...(rule?.terms ?? []), ...(override?.keywords ?? [])])];
  return { id: filePath, sinhalaName, englishName, keywords, category, url, sizeBytes };
}

export function normalizeColoringQuery(query: string): string {
  return searchable(query);
}

function queryTerms(query: string): string[] {
  const normalized = searchable(query);
  if (!normalized) return [];
  const tokens = normalized.split(" ");
  const expanded = tokens.flatMap(token => [token, ...(querySynonyms[token] ?? [])]);
  const categoryRule = categoryRules.find(rule => rule.terms.some(term => searchable(term) === normalized));
  if (categoryRule) expanded.push(...categoryRule.terms);
  return [...new Set(expanded.map(searchable).filter(Boolean))];
}

export function searchColoringSheets(sheets: ColoringSheet[], query: string, category?: ColoringCategory | "All"): ColoringSheet[] {
  const normalizedQuery = searchable(query);
  const terms = queryTerms(query);
  return sheets
    .filter(sheet => category === undefined || category === "All" || sheet.category === category)
    .map(sheet => {
      const title = searchable(`${sheet.sinhalaName} ${sheet.englishName}`);
      const keywords = searchable(sheet.keywords.join(" "));
      let score = 0;
      if (normalizedQuery && title === normalizedQuery) score = 100;
      else if (normalizedQuery && title.startsWith(normalizedQuery)) score = 80;
      else if (normalizedQuery && title.includes(normalizedQuery)) score = 60;
      else if (terms.some(term => title.includes(term))) score = 45;
      else if (terms.some(term => keywords.includes(term))) score = 35;
      else if (terms.some(term => categoryRules.some(rule => rule.names.some(name => searchable(name) === term) && rule.category === sheet.category))) score = 25;
      return { sheet, score };
    })
    .filter(result => !normalizedQuery || result.score > 0)
    .sort((left, right) => right.score - left.score || left.sheet.sinhalaName.localeCompare(right.sheet.sinhalaName, "si"))
    .map(result => result.sheet);
}

export const coloringCategories: Array<ColoringCategory | "All"> = [
  "All", "Animals", "Birds", "Flowers", "Fruits", "Vehicles", "Food & plants",
  "Letters & numbers", "Sports", "Cartoons & characters", "Nature", "People & places", "Other"
];
