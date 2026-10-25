"use client";

import { ArrowUpRight, BookOpen, FileText, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { OlPaper } from "@/lib/ol-papers";

const examinationYears = Array.from({ length: 2025 - 2007 + 1 }, (_, index) => 2025 - index);

export function OlPastPapers() {
  const [papers, setPapers] = useState<OlPaper[]>([]);
  const [year, setYear] = useState("all");
  const [subject, setSubject] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    void fetch("/api/ol-papers", { signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error("Paper catalogue could not be loaded.");
        const data = await response.json() as { papers?: OlPaper[] };
        if (!Array.isArray(data.papers)) throw new Error("Paper catalogue response was invalid.");
        setPapers(data.papers);
      })
      .catch(cause => {
        if (controller.signal.aborted) return;
        console.error("Could not load the O/L paper catalogue.", cause);
        setError("We couldn’t load the papers just now. Please refresh the page to try again.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  const subjects = useMemo(
    () => [...new Set(papers.map(paper => paper.subject))].sort((left, right) => left.localeCompare(right)),
    [papers]
  );
  const filteredPapers = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return papers.filter(paper =>
      (year === "all" || paper.year === Number(year))
      && (subject === "all" || paper.subject === subject)
      && (!query || `${paper.subject} ${paper.year} ${paper.medium} ${paper.syllabus ?? ""}`.toLocaleLowerCase().includes(query))
    );
  }, [papers, search, subject, year]);
  const papersByYear = useMemo(() => {
    const groups = new Map<number, OlPaper[]>();
    for (const paper of filteredPapers) {
      const group = groups.get(paper.year) ?? [];
      group.push(paper);
      groups.set(paper.year, group);
    }
    return [...groups.entries()];
  }, [filteredPapers]);
  const selectedYearHasPapers = year === "all" || papers.some(paper => paper.year === Number(year));
  return (
    <section className="ol-past-papers soft-card" aria-labelledby="ol-past-papers-title">
      <header className="ol-past-papers-header">
        <div className="ol-past-papers-copy">
          <span className="ol-past-papers-icon" aria-hidden="true"><BookOpen size={19}/></span>
          <div>
            <p className="ol-past-papers-eyebrow">STUDY · PRACTISE · SUCCEED</p>
            <h2 id="ol-past-papers-title">O/L Past Papers</h2>
            <p className="ol-past-papers-description">Browse by year or subject, then open a PDF directly.</p>
          </div>
        </div>
        <div className="ol-past-papers-total">
          <strong>{loading || error ? "—" : papers.length}</strong>
          <span>papers available</span>
        </div>
      </header>

      <div className="ol-past-papers-filters">
        <label className="ol-past-papers-field">
          <span>Examination year</span>
          <select value={year} onChange={event => setYear(event.target.value)}>
            <option value="all">All years</option>
            {examinationYears.map(examinationYear => (
              <option key={examinationYear} value={examinationYear}>{examinationYear}</option>
            ))}
          </select>
        </label>
        <label className="ol-past-papers-field">
          <span>Subject</span>
          <select value={subject} onChange={event => setSubject(event.target.value)}>
            <option value="all">All subjects</option>
            {subjects.map(subjectName => (
              <option key={subjectName} value={subjectName}>{subjectName}</option>
            ))}
          </select>
        </label>
        <label className="ol-past-papers-search">
          <Search size={16} aria-hidden="true"/>
          <span className="sr-only">Search papers</span>
          <input
            type="search"
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Search subjects or medium"
          />
        </label>
      </div>

      <div className="ol-past-papers-results" aria-live="polite">
        {loading ? (
          <div className="ol-past-papers-state">Loading papers…</div>
        ) : error ? (
          <div className="ol-past-papers-state ol-past-papers-error" role="alert">{error}</div>
        ) : filteredPapers.length ? (
          <>
            <div className="ol-past-papers-result-count">
              Showing <strong>{filteredPapers.length}</strong> {filteredPapers.length === 1 ? "paper" : "papers"}
              {subject !== "all" ? <> for <strong>{subject}</strong></> : null}
              {year === "all" && subject !== "all" ? " across all available years" : null}
            </div>
            {papersByYear.map(([paperYear, yearPapers]) => (
              <section className="ol-past-papers-year-group" key={paperYear} aria-labelledby={`ol-year-${paperYear}`}>
                <div className="ol-past-papers-year-heading">
                  <h3 id={`ol-year-${paperYear}`}>{paperYear} O/L</h3>
                  <span>{yearPapers.length} {yearPapers.length === 1 ? "paper" : "papers"}</span>
                </div>
                <div className="ol-past-papers-grid">
                  {yearPapers.map(paper => (
                    <article className="ol-past-papers-card" key={paper.id}>
                      <span className="ol-past-papers-file-icon" aria-hidden="true"><FileText size={17}/></span>
                      <div className="ol-past-papers-card-copy">
                        <h4>{paper.subject}</h4>
                        <div className="ol-past-papers-tags">
                          <span>{paper.medium}</span>
                          {paper.syllabus && <span>{paper.syllabus}</span>}
                        </div>
                      </div>
                      <a
                        className="ol-past-papers-open"
                        href={paper.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${paper.year} ${paper.subject}, ${paper.medium} PDF in a new tab`}
                      >
                        Open PDF <ArrowUpRight size={14}/>
                      </a>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </>
        ) : !selectedYearHasPapers ? (
          <div className="ol-past-papers-state">
            <h3>No local PDFs for {year}</h3>
            <p>There are no PDF files for this year in the local papers folder.</p>
          </div>
        ) : (
          <div className="ol-past-papers-state">
            <h3>No matching papers found</h3>
            <p>Try another year or subject, or clear the search text.</p>
            <button
              className="secondary-button"
              type="button"
              onClick={() => { setYear("all"); setSubject("all"); setSearch(""); }}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
      {!loading && !error && year === "all" && (
        <p className="ol-past-papers-note">
          Local PDFs are available for 2015–2024. Select a subject to view its papers from every available year.
        </p>
      )}
    </section>
  );
}
