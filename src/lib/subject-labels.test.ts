import { describe, expect, it } from "vitest";
import { englishSubjectName } from "./subject-labels";

describe("English subject labels", () => {
  it.each([
    ["ගණිතය", "Mathematics"],
    ["ඉංග්‍රීසි", "English"],
    ["සිංහල", "Sinhala"],
    ["දෙමළ", "Tamil"],
    ["පරිසරය", "Environmental Studies"],
    ["ආගම", "Religion"],
    ["චිත්‍ර", "Art"]
  ])("translates a legacy Sinhala label %s", (label, expected) => {
    expect(englishSubjectName({ en: label, si: label })).toBe(expected);
  });

  it("uses an English value when the stored English field contains Sinhala", () => {
    expect(englishSubjectName({ en: "සිංහල", si: "Sinhala" })).toBe("Sinhala");
  });

  it("preserves an existing English label", () => {
    expect(englishSubjectName({ en: "Mathematics", si: "ගණිතය" })).toBe("Mathematics");
  });

  it("does not display an unknown Sinhala-only label in English mode", () => {
    expect(englishSubjectName({ en: "අලුත් විෂය", si: "අලුත් විෂය" })).toBe("Custom subject");
  });
});
