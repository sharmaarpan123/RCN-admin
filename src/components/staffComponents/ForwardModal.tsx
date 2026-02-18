"use client";

import React, { useState, useEffect } from "react";
import type { Company } from "@/app/staff-portal/inbox/types";

export type { Company };

interface ForwardModalProps {
  isOpen: boolean;
  onClose: () => void;
  refId: string | null;
  servicesRequested: { name: string; id: string }[];
  companyDirectory: Company[];
  selectedCompany: Company | null;
  onSelectCompany: (c: Company | null) => void;
  onForward: (company: Company, customServices: string[] | null) => void;
  onAddCompanyAndSelect: (name: string, email: string) => void;
}

export function ForwardModal({
  isOpen,
  onClose,
  refId,
  servicesRequested,
  companyDirectory,
  selectedCompany,
  onSelectCompany,
  onForward,
  onAddCompanyAndSelect,
}: ForwardModalProps) {
  const [fwdSearch, setFwdSearch] = useState("");
  const [fwdServicesMode, setFwdServicesMode] = useState<"ALL" | "CUSTOM">("ALL");
  const [fwdAddBoxShow, setFwdAddBoxShow] = useState(false);
  const [fwdNewName, setFwdNewName] = useState("");
  const [fwdNewEmail, setFwdNewEmail] = useState("");

  useEffect(() => {
    if (isOpen) {
      setFwdSearch("");
      setFwdServicesMode("ALL");
      setFwdAddBoxShow(false);
      setFwdNewName("");
      setFwdNewEmail("");
      onSelectCompany(null);
    }
  }, [isOpen, onSelectCompany]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const term = (fwdSearch || "").trim().toLowerCase();
  const results = companyDirectory
    .filter((c) => !term || c.name.toLowerCase().includes(term))
    .slice(0, 50);

  const readCustomServices = (): string[] | null => {
    if (fwdServicesMode !== "CUSTOM") return null;
    const checks = Array.from(document.querySelectorAll("#fwdServicesChecks input[type='checkbox']")) as HTMLInputElement[];
    const chosen = checks.filter((x) => x.checked).map((x) => x.getAttribute("data-svc") || "");
    return chosen.filter(Boolean).length ? chosen : null;
  };

  const handleAddAndSelect = () => {
    const name = fwdNewName.trim();
    if (!name) {
      alert("Please enter a company name.");
      return;
    }
    onAddCompanyAndSelect(name, fwdNewEmail.trim());
    setFwdAddBoxShow(false);
    setFwdNewName("");
    setFwdNewEmail("");
  };

  const handleConfirm = () => {
    if (!selectedCompany?.name) {
      alert("Please select a company (or add a new one) before forwarding.");
      return;
    }
    onForward(selectedCompany, readCustomServices());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/55 flex items-center justify-center p-4 z-[999]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      aria-hidden="false"
    >
      <div
        className="w-full max-w-[780px] bg-white/98 border border-slate-200 rounded-[18px] shadow-[0_30px_80px_rgba(2,6,23,.35)] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Forward referral modal"
      >
        <div
          className="p-3.5 border-b border-rcn-brand/20 flex items-start justify-between gap-3"
          style={{ background: "linear-gradient(90deg, rgba(15,107,58,.18), rgba(31,138,76,.12), rgba(31,138,76,.06))" }}
        >
          <div>
            <h3 className="m-0 text-sm font-black tracking-wide">Forward Referral to Another Company</h3>
            <p className="m-0 mt-1.5 text-rcn-muted text-xs font-[850]">Search and select a company, optionally choose services, then forward.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="border border-slate-200 bg-white px-2.5 py-2 rounded-xl font-extrabold text-xs shadow-[0_8px_18px_rgba(2,6,23,.06)]"
          >
            Close
          </button>
        </div>

        <div className="p-3.5 flex flex-col gap-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="text-rcn-muted text-xs font-[850] leading-snug mb-1.5">Search Company (type-to-find)</div>
              <input
                id="fwdSearch"
                value={fwdSearch}
                onChange={(e) => setFwdSearch(e.target.value)}
                placeholder="Type a company name…"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white outline-none text-sm font-[850] text-rcn-text"
              />
            </div>
            <div>
              <div className="text-rcn-muted text-xs font-[850] leading-snug mb-1.5">Services Requested (optional)</div>
              <select
                id="fwdServicesMode"
                value={fwdServicesMode}
                onChange={(e) => setFwdServicesMode(e.target.value as "ALL" | "CUSTOM")}
                className="w-full border border-slate-200 bg-white rounded-xl py-2 px-2.5 text-xs font-[850] text-rcn-text outline-none"
                aria-label="Services selection mode"
              >
                <option value="ALL">All services (default)</option>
                <option value="CUSTOM">Custom selection</option>
              </select>
            </div>
          </div>

          {fwdServicesMode === "CUSTOM" && (
            <div className="border border-dashed border-rcn-brand/35 rounded-[14px] bg-rcn-brand/5 p-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <strong className="text-xs font-black">Custom Services Selection</strong>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-black border border-blue-300 bg-blue-100 text-blue-800">Optional</span>
              </div>
              <div className="text-rcn-muted text-xs font-[850] mt-1.5">Choose services to send. If none selected, forwarding defaults to all services.</div>
              <div id="fwdServicesChecks" className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {(servicesRequested || []).map((s, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-2.5 border border-slate-200 rounded-xl bg-white/90">
                    <input type="checkbox" id={`svc_${i}`} data-svc={s} className="rounded" />
                    <label htmlFor={`svc_${i}`} className="text-xs font-black text-rcn-text">{s.name}</label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border border-slate-200 rounded-[14px] bg-white overflow-hidden">
            <div className="px-3 py-2.5 bg-rcn-brand/5 border-b border-slate-200 flex items-center justify-between gap-2">
              <strong className="text-xs font-black">Company Results</strong>
              <span className="text-[11px] text-rcn-muted font-black">{results.length} found</span>
            </div>
            <div className="max-h-[260px] overflow-auto">
              {!results.length ? (
                <div className="p-3 text-rcn-muted font-black text-sm">No matches. Use "Add Referral Receiver (if not listed)".</div>
              ) : (
                results.map((c, idx) => (
                  <div
                    key={idx}
                    onClick={() => onSelectCompany(c)}
                    className={`px-3 py-2.5 border-b border-slate-200 flex items-center justify-between gap-3 cursor-pointer last:border-b-0 ${selectedCompany?.name === c.name ? "bg-rcn-brand/10 outline-2 outline-rcn-brand/15 -outline-offset-2" : "hover:bg-rcn-brand/5"
                      }`}
                  >
                    <div className="flex flex-col gap-0.5">
                      <strong className="text-[13px] font-black">{c.name}</strong>
                      <small className="text-rcn-muted text-[11px] font-black">{c.email || "No email listed"}</small>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-black border border-blue-300 bg-blue-100 text-blue-800">Select</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="border border-dashed border-rcn-brand/35 rounded-[14px] bg-rcn-brand/5 p-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <strong className="text-xs font-black">Selected Company</strong>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-black border ${selectedCompany ? "border-rcn-brand/30 bg-rcn-brand/10 text-rcn-accent-dark" : "border-slate-300 bg-slate-100 text-slate-600"
                  }`}
              >
                {selectedCompany ? "Selected" : "None selected"}
              </span>
            </div>
            <div className="text-rcn-muted text-xs font-[850] mt-1.5">
              {selectedCompany ? `${selectedCompany.name}${selectedCompany.email ? " • " + selectedCompany.email : ""}` : "Select a company from the list or add a new one below."}
            </div>
          </div>

          <div className="flex gap-2.5 flex-wrap items-center justify-between">
            <button
              type="button"
              onClick={() => setFwdAddBoxShow(true)}
              className="border border-rcn-brand/30 bg-rcn-brand/10 text-rcn-accent-dark px-2.5 py-2 rounded-xl font-extrabold text-xs shadow-[0_8px_18px_rgba(2,6,23,.06)]"
            >
              Add Referral Receiver (if not listed)
            </button>
            <div className="text-rcn-muted text-xs font-[850]">This will add the company and select it for forwarding.</div>
          </div>

          {fwdAddBoxShow && (
            <div className="border border-dashed border-rcn-brand/35 rounded-[14px] bg-rcn-brand/5 p-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <div className="text-rcn-muted text-xs font-[850] mb-1.5">New Company Name</div>
                  <input
                    value={fwdNewName}
                    onChange={(e) => setFwdNewName(e.target.value)}
                    placeholder="Company name"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white outline-none text-sm font-[850]"
                  />
                </div>
                <div>
                  <div className="text-rcn-muted text-xs font-[850] mb-1.5">Company Email (optional)</div>
                  <input
                    value={fwdNewEmail}
                    onChange={(e) => setFwdNewEmail(e.target.value)}
                    placeholder="intake@company.com"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white outline-none text-sm font-[850]"
                  />
                </div>
              </div>
              <div className="flex gap-2.5 justify-end mt-2.5">
                <button type="button" onClick={() => setFwdAddBoxShow(false)} className="border border-slate-200 bg-white px-2.5 py-2 rounded-xl font-extrabold text-xs shadow">
                  Cancel
                </button>
                <button type="button" onClick={handleAddAndSelect} className="border border-rcn-brand/30 bg-rcn-brand/10 text-rcn-accent-dark px-2.5 py-2 rounded-xl font-extrabold text-xs shadow">
                  Add & Select
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="px-3.5 py-3 border-t border-slate-200 flex items-center justify-end gap-2.5 bg-white/95">
          <button type="button" onClick={onClose} className="border border-slate-200 bg-white px-2.5 py-2 rounded-xl font-extrabold text-xs shadow">
            Cancel
          </button>
          <button type="button" onClick={handleConfirm} className="border border-rcn-brand/30 bg-rcn-brand/10 text-rcn-accent-dark px-2.5 py-2 rounded-xl font-extrabold text-xs shadow">
            Forward Referral
          </button>
        </div>
      </div>
    </div>
  );
}
