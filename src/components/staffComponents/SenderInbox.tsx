"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Referral, Company } from "@/app/staff-portal/inbox/types";
import { fmtDate, pillClass, pillLabel, overallStatus } from "@/app/staff-portal/inbox/helpers";
import { ForwardModal } from "./ForwardModal";

interface SenderInboxProps {
  referrals: Referral[];
  setReferrals: React.Dispatch<React.SetStateAction<Referral[]>>;
  companyDirectory: Company[];
  setCompanyDirectory: React.Dispatch<React.SetStateAction<Company[]>>;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  dateFilterDays: number;
  setDateFilterDays: (d: number) => void;
  query: string;
  setQuery: (q: string) => void;
}

export function SenderInbox({
  referrals,
  setReferrals,
  companyDirectory,
  setCompanyDirectory,
  statusFilter,
  setStatusFilter,
  dateFilterDays,
  setDateFilterDays,
  query,
  setQuery,
}: SenderInboxProps) {
  const router = useRouter();
  const [forwardOpen, setForwardOpen] = useState(false);
  const [forwardRefId, setForwardRefId] = useState<string | null>(null);
  const [forwardSelectedCompany, setForwardSelectedCompany] = useState<Company | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const now = new Date();
    const cutoff = new Date(now.getTime() - dateFilterDays * 24 * 60 * 60 * 1000);
    return referrals
      .filter((ref) => {
        if (q) {
          const patient = `${ref.patient.last} ${ref.patient.first} ${ref.patient.dob}`.toLowerCase();
          const rxNames = ref.receivers.map((x) => x.name.toLowerCase()).join(" ");
          if (!`${ref.id} ${patient} ${rxNames}`.includes(q)) return false;
        }
        if (statusFilter !== "ALL") {
          const s = overallStatus(ref);
          if (statusFilter === "ACCEPTED") return ref.receivers.some((x) => ["ACCEPTED", "PAID", "COMPLETED"].includes(x.status));
          if (s !== statusFilter) return false;
        }
        if (new Date(ref.sentAt) < cutoff) return false;
        return true;
      })
      .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  }, [referrals, query, statusFilter, dateFilterDays]);

  const fullRef = forwardRefId ? referrals.find((r) => r.id === forwardRefId) : null;


  const openForward = useCallback((id: string) => {
    setForwardRefId(id);
    setForwardSelectedCompany(null);
    setForwardOpen(true);
  }, []);

  const forwardReferral = useCallback(
    (refId: string, company: Company, customServices: string[] | null) => {
      const rxId = "RX-FWD-" + Math.random().toString(16).slice(2, 8).toUpperCase();
      setReferrals((prev) =>
        prev.map((r) => {
          if (r.id !== refId) return r;
          const receivers = [...r.receivers, { receiverId: rxId, name: company.name.trim(), email: (company.email || "").trim(), status: "PENDING", paidUnlocked: false, updatedAt: new Date(), rejectReason: "", servicesRequestedOverride: customServices || null }];
          const chat = { ...r.chatByReceiver, [rxId]: [] };
          const comms = [...r.comms, { at: new Date(), who: "Sender", msg: `Forwarded referral to ${company.name.trim()}${company.email ? " (" + company.email.trim() + ")" : ""}${customServices?.length ? " • Services: " + customServices.join(", ") : ""}.` }];
          return { ...r, receivers, chatByReceiver: chat, comms };
        })
      );
      setForwardOpen(false);
    },
    [setReferrals]
  );

  const addCompanyAndSelect = useCallback(
    (name: string, email: string) => {
      const n = name.trim();
      if (!n) return;
      if (!companyDirectory.some((c) => c.name.toLowerCase() === n.toLowerCase())) setCompanyDirectory((prev) => [{ name: n, email: email.trim() }, ...prev]);
      setForwardSelectedCompany({ name: n, email: email.trim() });
    },
    [companyDirectory, setCompanyDirectory]
  );

  return (
    <>
      <section className="mt-3.5 border border-slate-200 bg-white/65 rounded-2xl shadow-[0_10px_30px_rgba(2,6,23,.07)] overflow-hidden" aria-label="Sender inbox list">
        <div className="p-3.5 pt-3 pb-2.5 border-b border-slate-200 bg-white/90">
          <h2 className="m-0 text-sm font-semibold tracking-wide">Sender Inbox</h2>
          <p className="m-0 mt-1 text-rcn-muted text-xs font-[850]">Search, filter, and click a referral to view details.</p>
        </div>
        <div className="flex flex-col gap-2.5 p-3 border-b border-slate-200 bg-white/90">
          <input id="q" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search patient, DOB, receiver, referral ID…" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white outline-none text-[13px]  text-rcn-text" aria-label="Search inbox" />
          <div className="flex gap-2 flex-wrap" aria-label="Status filters">
            {["ALL", "PENDING", "ACCEPTED", "REJECTED", "PAID", "COMPLETED"].map((f) => (
              <button key={f} type="button" onClick={() => setStatusFilter(f)} className={`inline-flex items-center gap-1.5 px-2.5 py-2 rounded-full border cursor-pointer text-xs font-extrabold select-none ${statusFilter === f ? "bg-rcn-brand/10 border-rcn-brand/20 text-rcn-accent-dark" : "border-slate-200 bg-white text-rcn-muted"}`}>
                {f === "ALL" ? "All" : f === "PAID" ? "Paid/Unlocked" : f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap" aria-label="Date filters">
            {[[30, "Last 30 days"], [7, "Last 7 days"], [90, "Last 90 days"], [3650, "All time"]].map(([days, label]) => (
              <button key={String(days)} type="button" onClick={() => setDateFilterDays(Number(days))} className={`inline-flex items-center gap-1.5 px-2.5 py-2 rounded-full border cursor-pointer text-xs font-extrabold select-none ${dateFilterDays === days ? "bg-rcn-brand/10 border-rcn-brand/20 text-rcn-accent-dark" : "border-slate-200 bg-white text-rcn-muted"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-auto max-w-full">
          {filtered.length === 0 ? (
            <div className="py-5 px-3.5 text-center text-rcn-muted font-extrabold text-[13px]">No referrals match your filters.</div>
          ) : (
            <table className="w-full border-collapse text-xs ">
              <thead>
                <tr className="bg-rcn-brand/10">
                  <th className="text-left p-2.5 font-black text-[11px] uppercase tracking-wide border-b border-slate-200">Referral ID</th>
                  <th className="text-left p-2.5 font-black text-[11px] uppercase border-b border-slate-200">Patient</th>
                  <th className="text-left p-2.5 font-black text-[11px] uppercase border-b border-slate-200">Services</th>
                  <th className="text-left p-2.5 font-black text-[11px] uppercase border-b border-slate-200">Receivers</th>
                  <th className="text-left p-2.5 font-black text-[11px] uppercase border-b border-slate-200">Status</th>
                  <th className="text-left p-2.5 font-black text-[11px] uppercase border-b border-slate-200">Sent Date</th>
                  <th className="text-left p-2.5 font-black text-[11px] uppercase border-b border-slate-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ref) => {
                  const st = overallStatus(ref);
                  const receiversLabel = ref.receivers.length > 1 ? `${ref.receivers.length} receivers` : ref.receivers[0]?.name ?? "";
                  const svc = ref.servicesRequested.slice(0, 2).join(", ") + (ref.servicesRequested.length > 2 ? ` +${ref.servicesRequested.length - 2} more` : "");
                  const patientLine = `${ref.patient.last}, ${ref.patient.first} • DOB ${ref.patient.dob}`;
                  return (
                    <tr key={ref.id} className="border-b border-slate-200 hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => router.push(`/staff-portal/inbox/sender/${ref.id}`)}>
                      <td className="p-2.5 font-black text-[13px]">{ref.id}</td>
                      <td className="p-2.5 font-[850] text-[13px]">{patientLine}</td>
                      <td className="p-2.5 text-rcn-muted text-xs font-[850]">{svc || "—"}</td>
                      <td className="p-2.5 text-rcn-muted text-xs font-[850]">{receiversLabel}</td>
                      <td className="p-2.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-black border ${pillClass(st)}`}>{pillLabel(st)}</span>
                      </td>
                      <td className="p-2.5 text-rcn-muted text-xs font-[850]">{fmtDate(ref.sentAt)}</td>
                      <td className="p-2.5 flex gap-1">
                        <button type="button" onClick={(e) => { e.stopPropagation(); router.push(`/staff-portal/inbox/sender/${ref.id}`); }} className="border border-rcn-brand/25 bg-rcn-brand/10 text-rcn-accent-dark px-2 py-1.5 rounded-xl font-extrabold text-xs shadow mr-1">View</button>
                        <button type="button" onClick={(e) => { e.stopPropagation(); openForward(ref.id); }} className="border border-slate-200 bg-white px-2 py-1.5 rounded-xl font-extrabold text-xs shadow">Forward</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <ForwardModal
        isOpen={forwardOpen}
        onClose={() => { setForwardOpen(false); setForwardRefId(null); setForwardSelectedCompany(null); }}
        refId={forwardRefId}
        servicesRequested={fullRef?.servicesRequested ?? []}
        companyDirectory={companyDirectory}
        selectedCompany={forwardSelectedCompany}
        onSelectCompany={setForwardSelectedCompany}
        onForward={(company, customServices) => forwardRefId && forwardReferral(forwardRefId, company, customServices)}
        onAddCompanyAndSelect={addCompanyAndSelect}
      />
    </>
  );
}
