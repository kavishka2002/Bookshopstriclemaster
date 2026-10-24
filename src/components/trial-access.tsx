"use client";

import { createContext, useContext, useEffect, useState, type MouseEvent as ReactMouseEvent, type ReactNode } from "react";
import { LockKeyhole, MessageCircle, X } from "lucide-react";

const TrialAccessContext = createContext(false);
const paymentMessage = "Hi, I would like to get full access to PaperBloom. Please share payment details.";

export function useTrialAccess(): boolean {
  return useContext(TrialAccessContext);
}

export function TrialAccessBoundary({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  const [paymentOpen, setPaymentOpen] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;
    root.dataset.trialAccess = "locked";
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "p") {
        event.preventDefault();
        event.stopImmediatePropagation();
        setPaymentOpen(true);
      }
    };
    const handleContextMenu = (event: globalThis.MouseEvent) => {
      if (event.target instanceof Element && event.target.closest("img, canvas, iframe")) event.preventDefault();
    };
    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("contextmenu", handleContextMenu, true);
    return () => {
      delete root.dataset.trialAccess;
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("contextmenu", handleContextMenu, true);
    };
  }, [enabled]);

  const blockPaidFeature = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!enabled || !(event.target instanceof Element)) return;
    if (!event.target.closest("[data-paid-feature], a[download]")) return;
    event.preventDefault();
    event.stopPropagation();
    setPaymentOpen(true);
  };

  return <TrialAccessContext.Provider value={enabled}>
    <div className="trial-access-boundary" onClickCapture={blockPaidFeature}>
      {children}
      {enabled && paymentOpen && <div className="trial-payment-backdrop" onMouseDown={event => {
        if (event.target === event.currentTarget) setPaymentOpen(false);
      }}>
        <section className="trial-payment-dialog" role="dialog" aria-modal="true" aria-labelledby="trial-payment-title">
          <button className="trial-payment-close" type="button" aria-label="වසන්න" onClick={() => setPaymentOpen(false)}><X size={18}/></button>
          <div className="trial-payment-icon"><LockKeyhole size={23}/></div>
          <p className="trial-payment-eyebrow">PAPERBLOOM · FULL ACCESS</p>
          <h2 id="trial-payment-title">මුද්‍රණය සහ බාගත කිරීම unlock කරගන්න</h2>
          <p className="trial-payment-copy">Free trial එකේදී designs හදා preview බලන්න පුළුවන්. Print, download සහ export පහසුකම් ලබාගැනීමට full access ලබාගන්න.</p>
          <p className="trial-payment-price">රු. 2,499</p>
          <a className="trial-payment-whatsapp" href={`https://wa.me/94767660922?text=${encodeURIComponent(paymentMessage)}`} target="_blank" rel="noopener noreferrer">
            <MessageCircle size={17}/> WhatsApp හරහා විමසන්න · 0767660922
          </a>
          <p className="trial-payment-note">ගෙවීම් තහවුරු කිරීමෙන් පසු full access ලබාගැනීමට WhatsApp කරන්න.</p>
        </section>
      </div>}
    </div>
  </TrialAccessContext.Provider>;
}
