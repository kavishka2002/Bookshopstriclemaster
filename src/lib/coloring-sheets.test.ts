import { describe, expect, it } from "vitest";
import { createColoringSheet, searchColoringSheets } from "./coloring-sheets";

const sheets = [
  createColoringSheet("පින්තුර/මල් වර්ග.pdf", "/පින්තුර/මල්%20වර්ග.pdf", 1000),
  createColoringSheet("පින්තුර/මල්.pdf", "/පින්තුර/මල්.pdf", 900),
  createColoringSheet("පින්තුර/විවිධ සතුන්.pdf", "/පින්තුර/විවිධ%20සතුන්.pdf", 1200),
  createColoringSheet("පින්තුර/පළතුරු.pdf", "/පින්තුර/පළතුරු.pdf", 800)
];

describe("colouring sheet catalogue and search", () => {
  it("categorizes real filenames and produces local public metadata", () => {
    expect(sheets[0]).toMatchObject({ sinhalaName: "මල් වර්ග", category: "Flowers", url: "/පින්තුර/මල්%20වර්ග.pdf", sizeBytes: 1000 });
  });

  it("matches Sinhala and English flower aliases with exact titles ranked first", () => {
    expect(searchColoringSheets(sheets, "flower").map(sheet => sheet.sinhalaName)).toEqual(["මල්", "මල් වර්ග"]);
    expect(searchColoringSheets(sheets, "මල").map(sheet => sheet.category)).toEqual(["Flowers", "Flowers"]);
    expect(searchColoringSheets(sheets, " flowers ").map(sheet => sheet.category)).toEqual(["Flowers", "Flowers"]);
  });

  it("finds category-relevant Sinhala files from English animal searches", () => {
    expect(searchColoringSheets(sheets, "dogs").map(sheet => sheet.sinhalaName)).toContain("විවිධ සතුන්");
    expect(searchColoringSheets(sheets, "පළතුරු")[0].category).toBe("Fruits");
  });

  it("normalizes Sinhala joiners in filenames and search terms without losing the display spelling", () => {
    const sports = createColoringSheet("පින්තුර/අපේ ක්_රීඩකයෝ.pdf", "/sports.pdf", 500);
    expect(sports.sinhalaName).toBe("අපේ ක්‍රීඩකයෝ");
    expect(sports.category).toBe("Sports");
    expect(searchColoringSheets([sports], "ක්‍රීඩා")).toHaveLength(1);
  });
});
