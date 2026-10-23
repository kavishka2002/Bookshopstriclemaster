"use client";

import { BookOpen, ChevronLeft, ChevronRight, Download, FileText, History, LoaderCircle, Printer, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import type { RenderTask } from "pdfjs-dist/legacy/build/pdf.mjs";
import { LocalizedUi } from "@/components/app-language";
import { getActiveTenantId } from "@/lib/database";
import {
  coloringCategories, searchColoringSheets,
  type ColoringCategory, type ColoringSheet
} from "@/lib/coloring-sheets";

const SEARCH_HISTORY_KEY = () => `little-paper-colouring-searches:${getActiveTenantId()}`;
const RECENT_HISTORY_KEY = () => `little-paper-colouring-recent:${getActiveTenantId()}`;
const MAX_HISTORY = 8;
const PAGE_SIZE = 24;
pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString();

type RecentSheet = { id: string; printedAt?: number };

function readArray<T>(key: string): T[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(parsed) ? parsed as T[] : [];
  } catch (error) {
    console.error(`Could not read ${key}.`, error);
    return [];
  }
}

function formatFileSize(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function categoryName(category: ColoringCategory): string {
  return category === "Other" ? "Learning sheets" : category;
}

function PdfPageCanvas({
  url, pageNumber, lazy = false, onPageCount
}: {
  url: string;
  pageNumber: number;
  lazy?: boolean;
  onPageCount?: (count: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(!lazy || typeof window !== "undefined" && !("IntersectionObserver" in window));
  const [document, setDocument] = useState<pdfjs.PDFDocumentProxy | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!lazy || visible || !containerRef.current || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: "180px" });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [lazy, visible]);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    const loadingTask = pdfjs.getDocument({ url, isEvalSupported: false });
    void loadingTask.promise.then(pdfDocument => {
      if (cancelled) return;
      setDocument(pdfDocument);
      setError("");
      onPageCount?.(pdfDocument.numPages);
    }).catch(cause => {
      if (cancelled) return;
      console.error(`Could not render local PDF preview: ${url}`, cause);
      setError("Preview unavailable");
    });
    return () => {
      cancelled = true;
      void loadingTask.destroy().catch(cause => console.error("Could not release PDF preview resources.", cause));
    };
  }, [onPageCount, url, visible]);

  useEffect(() => {
    if (!document || !canvasRef.current) return;
    let cancelled = false;
    let renderTask: RenderTask | undefined;
    void document.getPage(pageNumber).then(page => {
      if (cancelled || !canvasRef.current) return;
      const viewport = page.getViewport({ scale: 1 });
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas rendering is unavailable in this browser.");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      renderTask = page.render({ canvasContext: context, viewport });
      return renderTask.promise;
    }).catch(cause => {
      if (cancelled) return;
      console.error(`Could not render PDF page ${pageNumber}.`, cause);
      setError("This PDF page could not be previewed.");
    });
    return () => {
      cancelled = true;
      renderTask?.cancel();
    };
  }, [document, pageNumber]);

  return <div ref={containerRef} className="relative flex h-full w-full items-center justify-center overflow-hidden bg-white">
    {!visible && <div className="grid h-full w-full place-items-center text-[#4a836d]"><FileText size={30}/></div>}
    {visible && !document && !error && <div className="absolute inset-0 grid place-items-center text-slate-400"><LoaderCircle className="animate-spin" size={20}/></div>}
    {error ? <div className="absolute inset-0 grid place-items-center bg-white p-3 text-center text-xs text-slate-500">{error}</div>
      : <canvas ref={canvasRef} className="relative z-10 max-h-full max-w-full object-contain"/>}
  </div>;
}

export function ColoringSheetLibrary() {
  const [sheets, setSheets] = useState<ColoringSheet[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ColoringCategory | "All">("All");
  const [sortOrder, setSortOrder] = useState<"relevance" | "name">("relevance");
  const [recentSearches, setRecentSearches] = useState<string[]>(() => typeof window === "undefined" ? [] : readArray<string>(SEARCH_HISTORY_KEY()));
  const [recentSheets, setRecentSheets] = useState<RecentSheet[]>(() => typeof window === "undefined" ? [] : readArray<RecentSheet>(RECENT_HISTORY_KEY()));
  const [selectedSheet, setSelectedSheet] = useState<ColoringSheet | null>(null);
  const [previewPage, setPreviewPage] = useState(1);
  const [previewPageCount, setPreviewPageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [historyError, setHistoryError] = useState("");
  const [visibleLimit, setVisibleLimit] = useState(PAGE_SIZE);

  useEffect(() => {
    void fetch("/api/coloring-sheets")
      .then(async response => {
        if (!response.ok) throw new Error("The colouring sheet folder could not be loaded.");
        const result: unknown = await response.json();
        if (!result || typeof result !== "object" || !("sheets" in result) || !Array.isArray(result.sheets)) {
          throw new Error("The colouring sheet catalogue response was invalid.");
        }
        setSheets(result.sheets as ColoringSheet[]);
      })
      .catch(cause => {
        console.error("Could not load colouring sheets.", cause);
        setError(cause instanceof Error ? cause.message : "Could not load colouring sheets.");
      })
      .finally(() => setLoading(false));
  }, []);

  const results = useMemo(() => {
    const matches = searchColoringSheets(sheets, query, category);
    return sortOrder === "name" ? [...matches].sort((a, b) => a.sinhalaName.localeCompare(b.sinhalaName, "si")) : matches;
  }, [category, query, sheets, sortOrder]);

  const recentById = useMemo(() => new Map(sheets.map(sheet => [sheet.id, sheet])), [sheets]);

  const rememberSheet = (sheet: ColoringSheet, printedAt?: number) => {
    const next = [{ id: sheet.id, ...(printedAt ? { printedAt } : {}) }, ...recentSheets.filter(item => item.id !== sheet.id)].slice(0, MAX_HISTORY);
    try {
      localStorage.setItem(RECENT_HISTORY_KEY(), JSON.stringify(next));
      setRecentSheets(next);
      setHistoryError("");
    } catch (cause) {
      console.error("Could not save recent colouring sheets.", cause);
      setHistoryError("Your browser could not save recent sheet history.");
    }
  };

  const saveSearch = () => {
    const value = query.trim();
    if (!value) return;
    const next = [value, ...recentSearches.filter(item => item.toLocaleLowerCase() !== value.toLocaleLowerCase())].slice(0, MAX_HISTORY);
    try {
      localStorage.setItem(SEARCH_HISTORY_KEY(), JSON.stringify(next));
      setRecentSearches(next);
      setHistoryError("");
    } catch (cause) {
      console.error("Could not save recent colouring searches.", cause);
      setHistoryError("Your browser could not save recent search history.");
    }
  };

  const openPreview = (sheet: ColoringSheet) => {
    setSelectedSheet(sheet);
    setPreviewPage(1);
    setPreviewPageCount(0);
    rememberSheet(sheet);
  };

  const openForPrint = (sheet: ColoringSheet) => {
    window.open(sheet.url, "_blank", "noopener,noreferrer");
    rememberSheet(sheet, Date.now());
  };

  const clearHistory = () => {
    setRecentSearches([]);
    setRecentSheets([]);
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY());
      localStorage.removeItem(RECENT_HISTORY_KEY());
      setHistoryError("");
    } catch (cause) {
      console.error("Could not clear colouring sheet history.", cause);
      setHistoryError("Your browser could not clear the saved history.");
    }
  };

  return <LocalizedUi><div className="coloring-library space-y-6">
    <section className="overflow-hidden rounded-[24px] border border-[#e2ece6] bg-gradient-to-br from-[#eaf4ee] via-[#f4f8f3] to-[#f7f0e4] p-6 md:p-8">
      <div className="max-w-3xl">
        <div className="eyebrow">PICTURE COLOURING LIBRARY</div>
        <h1 className="page-title mt-2">Find a picture to colour</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Search the shop’s locally stored PDF sheets by Sinhala or English name, topic, or category.</p>
        <form className="mt-5 flex max-w-2xl items-center gap-2 rounded-2xl border border-white bg-white p-2 shadow-sm" onSubmit={event => { event.preventDefault(); saveSearch(); }}>
          <Search className="ml-2 shrink-0 text-[#5c8c75]" size={20}/>
          <input
            aria-label="Search colouring sheets"
            className="min-w-0 flex-1 border-0 bg-transparent px-1 py-2 text-sm outline-none"
            placeholder="පින්තූර කොළයක් සොයන්න... / Search colouring sheets..."
            value={query}
            onChange={event => { setQuery(event.target.value); setVisibleLimit(PAGE_SIZE); }}
          />
          {query && <button type="button" aria-label="Clear search" className="icon-action" onClick={() => { setQuery(""); setVisibleLimit(PAGE_SIZE); }}><X size={17}/></button>}
          <button className="primary-button shrink-0" type="submit">Search</button>
        </form>
        <div className="mt-3 flex flex-wrap gap-2">
          {coloringCategories.filter(item => item !== "All").map(item =>
            <button key={item} className={`filter-chip ${category === item ? "selected" : ""}`} onClick={() => { setCategory(category === item ? "All" : item); setVisibleLimit(PAGE_SIZE); }}>{categoryName(item)}</button>
          )}
        </div>
      </div>
    </section>

    {historyError && <p className="text-xs text-rose-700" role="status">{historyError}</p>}

    {recentSearches.length > 0 && <section className="soft-card p-4 md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><History size={16} className="text-[#548b72]"/><h2 className="text-sm font-bold">Recent searches</h2></div><button className="text-xs text-slate-500 hover:text-[#347765]" onClick={clearHistory}>Clear history</button></div>
      <div className="mt-3 flex flex-wrap gap-2">{recentSearches.map(term => <button key={term} className="filter-chip" onClick={() => { setQuery(term); setVisibleLimit(PAGE_SIZE); }}>{term}</button>)}</div>
    </section>}

    {recentSheets.length > 0 && <section className="soft-card p-4 md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><BookOpen size={16} className="text-[#548b72]"/><h2 className="text-sm font-bold">Recently opened or printed</h2></div><button className="text-xs text-slate-500 hover:text-[#347765]" onClick={clearHistory}>Clear history</button></div>
      <div className="mt-3 flex flex-wrap gap-2">{recentSheets.map(item => {
        const sheet = recentById.get(item.id);
        return sheet ? <button key={item.id} className="filter-chip" onClick={() => openPreview(sheet)}>{sheet.sinhalaName}{item.printedAt ? " · Print requested" : ""}</button> : null;
      })}</div>
    </section>}

    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div><h2 className="text-lg font-bold">Colouring sheets</h2><p className="mt-1 text-xs text-slate-500">{loading ? "Reading local PDF files…" : `${results.length} of ${sheets.length} PDF sheets`}</p></div>
        <label className="flex items-center gap-2 text-xs text-slate-600">Sort
          <select className="text-input !min-h-9 !w-auto" value={sortOrder} onChange={event => setSortOrder(event.target.value as "relevance" | "name")}><option value="relevance">Most relevant</option><option value="name">Name</option></select>
        </label>
      </div>
      {error ? <div className="empty-large" role="alert"><h3>Could not load local PDFs</h3><p>{error}</p></div>
        : loading ? <div className="soft-card flex items-center justify-center gap-3 p-10 text-sm text-slate-500"><LoaderCircle className="animate-spin" size={19}/> Loading the PDF library…</div>
          : results.length ? <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {results.slice(0, visibleLimit).map(sheet => <article className="soft-card overflow-hidden" key={sheet.id}>
              <div className="relative h-44 overflow-hidden bg-[#f4f7f4]">
                <PdfPageCanvas url={sheet.url} pageNumber={1} lazy/>
                <button className="absolute inset-0 z-20 w-full" aria-label={`Preview ${sheet.sinhalaName}`} onClick={() => openPreview(sheet)}/>
              </div>
              <div className="p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b927e]">{categoryName(sheet.category)}</span>
                <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-slate-700">{sheet.sinhalaName}</h3>
                <p className="truncate text-xs text-slate-500" title={sheet.englishName}>{sheet.englishName}</p>
                <p className="mt-1 text-[11px] text-slate-400">PDF · {formatFileSize(sheet.sizeBytes)}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="small-action flex-1" onClick={() => openPreview(sheet)}><BookOpen size={13}/> Preview</button>
                  <button className="small-action flex-1" onClick={() => openForPrint(sheet)}><Printer size={13}/> Print</button>
                  <a className="small-action flex-1" href={sheet.url} download><Download size={13}/> Save PDF</a>
                </div>
              </div>
            </article>)}
            </div>
            {results.length > visibleLimit && <div className="mt-5 text-center"><button className="secondary-button" onClick={() => setVisibleLimit(limit => limit + PAGE_SIZE)}>Show more ({results.length - visibleLimit} remaining)</button></div>}
          </> : <div className="empty-large"><div className="empty-illustration"><Search size={26}/></div><h3>No matching colouring sheets</h3><p>Try a shorter Sinhala or English word, choose another category, or clear the search.</p><button className="secondary-button mt-4" onClick={() => { setQuery(""); setCategory("All"); setVisibleLimit(PAGE_SIZE); }}>Clear filters</button></div>}
    </section>

    {selectedSheet && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-3 md:p-8" role="dialog" aria-modal="true" aria-label={`Preview ${selectedSheet.sinhalaName}`} onMouseDown={event => { if (event.target === event.currentTarget) setSelectedSheet(null); }}>
      <section className="flex h-[min(92vh,900px)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 md:px-5">
          <div className="min-w-0"><h2 className="truncate text-sm font-bold">{selectedSheet.sinhalaName}</h2><p className="mt-1 text-xs text-slate-500">{categoryName(selectedSheet.category)} · PDF · {formatFileSize(selectedSheet.sizeBytes)}</p></div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="flex items-center gap-1 rounded-lg border border-slate-200 px-1">
              <button className="icon-action !h-8 !w-8" aria-label="Previous page" disabled={previewPage <= 1} onClick={() => setPreviewPage(page => Math.max(1, page - 1))}><ChevronLeft size={16}/></button>
              <span className="min-w-16 text-center text-xs text-slate-500">Page {previewPage} / {previewPageCount || "…"}</span>
              <button className="icon-action !h-8 !w-8" aria-label="Next page" disabled={previewPageCount === 0 || previewPage >= previewPageCount} onClick={() => setPreviewPage(page => Math.min(previewPageCount, page + 1))}><ChevronRight size={16}/></button>
            </div>
            <button className="secondary-button !py-2" title="Opens the PDF in a new tab; use the PDF viewer's Print control." onClick={() => openForPrint(selectedSheet)}><Printer size={14}/> Print</button>
            <a className="secondary-button !py-2" href={selectedSheet.url} download><Download size={14}/> Save PDF</a>
            <button className="icon-action" aria-label="Close preview" onClick={() => setSelectedSheet(null)}><X size={18}/></button>
          </div>
        </header>
        <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-slate-100 p-3">
          <PdfPageCanvas url={selectedSheet.url} pageNumber={previewPage} onPageCount={setPreviewPageCount}/>
        </div>
      </section>
    </div>}
  </div></LocalizedUi>;
}
