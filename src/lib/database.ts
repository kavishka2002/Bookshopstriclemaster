import type { ImageAsset, StickerDesign, StickerTemplate, SubjectPreset } from "@/types";
import type { CustomPrintDesign } from "./custom-print";
import type { SavedPaper } from "./past-papers";
import type { CvDraft } from "./cv";

const DB_NAME = "little-paper-studio";
const DB_VERSION = 5;
type StoreName = "designs" | "templates" | "assets" | "subjects" | "customPrintDesigns" | "pastPapers" | "cvDrafts";

function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") return Promise.reject(new Error("Local browser storage is unavailable."));
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("designs")) db.createObjectStore("designs", { keyPath: "id" });
      if (!db.objectStoreNames.contains("templates")) db.createObjectStore("templates", { keyPath: "id" });
      if (!db.objectStoreNames.contains("assets")) db.createObjectStore("assets", { keyPath: "id" });
      if (!db.objectStoreNames.contains("subjects")) db.createObjectStore("subjects", { keyPath: "gradeBand" });
      if (!db.objectStoreNames.contains("customPrintDesigns")) db.createObjectStore("customPrintDesigns", { keyPath: "id" });
      if (!db.objectStoreNames.contains("pastPapers")) db.createObjectStore("pastPapers", { keyPath: "id" });
      if (!db.objectStoreNames.contains("cvDrafts")) db.createObjectStore("cvDrafts", { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open local design storage."));
  });
}

async function request<T>(storeName: StoreName, mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const req = action(tx.objectStore(storeName));
    let result: T;
    let requestCompleted = false;
    req.onsuccess = () => {
      result = req.result;
      requestCompleted = true;
    };
    req.onerror = () => reject(req.error ?? new Error(`Could not access ${storeName}.`));
    tx.onabort = () => {
      db.close();
      reject(tx.error ?? new Error(`Could not save ${storeName}.`));
    };
    tx.oncomplete = () => {
      db.close();
      if (requestCompleted) resolve(result);
      else reject(new Error(`Could not complete the ${storeName} transaction.`));
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error ?? new Error(`Could not access ${storeName}.`));
    };
  });
}

export const db = {
  getAllDesigns: () => request<StickerDesign[]>("designs", "readonly", store => store.getAll()),
  putDesign: (design: StickerDesign) => request<IDBValidKey>("designs", "readwrite", store => store.put(design)),
  deleteDesign: (id: string) => request<undefined>("designs", "readwrite", store => store.delete(id)),
  getAllTemplates: () => request<StickerTemplate[]>("templates", "readonly", store => store.getAll()),
  putTemplate: (template: StickerTemplate) => request<IDBValidKey>("templates", "readwrite", store => store.put(template)),
  deleteTemplate: (id: string) => request<undefined>("templates", "readwrite", store => store.delete(id)),
  getAllAssets: () => request<ImageAsset[]>("assets", "readonly", store => store.getAll()),
  putAsset: (asset: ImageAsset) => request<IDBValidKey>("assets", "readwrite", store => store.put(asset)),
  deleteAsset: (id: string) => request<undefined>("assets", "readwrite", store => store.delete(id)),
  getAllSubjectPresets: () => request<SubjectPreset[]>("subjects", "readonly", store => store.getAll()),
  putSubjectPreset: (preset: SubjectPreset) => request<IDBValidKey>("subjects", "readwrite", store => store.put(preset)),
  getAllCustomPrintDesigns: () => request<CustomPrintDesign[]>("customPrintDesigns", "readonly", store => store.getAll()),
  putCustomPrintDesign: (design: CustomPrintDesign) => request<IDBValidKey>("customPrintDesigns", "readwrite", store => store.put(design)),
  deleteCustomPrintDesign: (id: string) => request<undefined>("customPrintDesigns", "readwrite", store => store.delete(id)),
  getAllPastPapers: () => request<SavedPaper[]>("pastPapers", "readonly", store => store.getAll()),
  putPastPaper: (paper: SavedPaper) => request<IDBValidKey>("pastPapers", "readwrite", store => store.put(paper)),
  deletePastPaper: (id: string) => request<undefined>("pastPapers", "readwrite", store => store.delete(id)),
  getCvDraft: () => request<CvDraft | undefined>("cvDrafts", "readonly", store => store.get("current")),
  putCvDraft: (draft: CvDraft) => request<IDBValidKey>("cvDrafts", "readwrite", store => store.put(draft)),
  deleteCvDraft: () => request<undefined>("cvDrafts", "readwrite", store => store.delete("current"))
};

const RECENTS_KEY = "little-paper-recent-ids";
export function readRecentIds(): string[] {
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    const value: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === "string").slice(0, 10) : [];
  } catch (error) {
    console.error("Could not read recent designs.", error);
    return [];
  }
}

export function writeRecentIds(id: string): void {
  try {
    const recent = [id, ...readRecentIds().filter(existing => existing !== id)].slice(0, 10);
    localStorage.setItem(RECENTS_KEY, JSON.stringify(recent));
  } catch (error) {
    console.error("Could not update recent designs.", error);
    throw new Error("The design was saved, but the recent list could not be updated.");
  }
}
