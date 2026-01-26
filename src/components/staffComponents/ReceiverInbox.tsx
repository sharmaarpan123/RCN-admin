"use client";

import React, { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { RECEIVER_CTX } from "@/app/staff-portal/inbox/demo-data";
import { fmtDate, pillClass, pillLabel } from "@/app/staff-portal/inbox/helpers";
import type { Referral } from "@/app/staff-portal/inbox/types";

interface ReceiverInboxProps {
  referrals: Referral[];
  setReferrals: React.Dispatch<React.SetStateAction<Referral[]>>;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  dateFilterDays: number;
  setDateFilterDays: (d: number) => void;
  query: string;
  setQuery: (q: string) => void;
}

export function ReceiverInbox({
  referrals,
  setReferrals, // Unused but kept for interface consistency
  statusFilter,
  setStatusFilter,
  dateFilterDays,
  setDateFilterDays,
  query,
  setQuery,
}: ReceiverInboxProps) {
  const router = useRouter();

  const getInboxRefs = useCallback((): Referral[] => {
    return referrals
      .filter((r) => r.receivers.some((rx) => rx.receiverId === RECEIVER_CTX.receiverId))
      .map((r) => {
        const inst = r.receivers.find((rx) => rx.receiverId === RECEIVER_CTX.receiverId);
        return {
          ...r,
          receivers: inst ? [inst] : [],
          chatByReceiver: { [RECEIVER_CTX.receiverId]: r.chatByReceiver?.[RECEIVER_CTX.receiverId] || [] },
        };
      });
  }, [referrals]);

  const filtered = useMemo(() => {
    const refs = getInboxRefs();
    const q = query.trim().toLowerCase();
    const now = new Date();
    const cutoff = new Date(now.getTime() - dateFilterDays * 24 * 60 * 60 * 1000);
    return refs
      .filter((ref) => {
        if (q) {
          const patient = `${ref.patient.last} ${ref.patient.first} ${ref.patient.dob}`.toLowerCase();
          const rxNames = ref.receivers.map((x) => x.name.toLowerCase()).join(" ");
          if (!`${ref.id} ${patient} ${rxNames}`.includes(q)) return false;
        }
        if (statusFilter !== "ALL") {
          const s = ref.receivers[0]?.status || "PENDING";
          if (statusFilter === "ACCEPTED") return ["ACCEPTED", "PAID", "COMPLETED"].includes(s);
          if (s !== statusFilter) return false;
        }
        if (new Date(ref.sentAt) < cutoff) return false;
        return true;
      })
      .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  }, [getInboxRefs, query, statusFilter, dateFilterDays]);



  return (
    <section className="mt-3.5 border border-slate-200 bg-white/65 rounded-2xl shadow-[0_10px_30px_rgba(2,6,23,.07)] overflow-hidden" aria-label="Receiver inbox list">
      <div className="p-3.5 pt-3 pb-2.5 border-b border-slate-200 bg-white/90">
        <h2 className="m-0 text-sm font-semibold tracking-wide">Receiver Inbox</h2>
        <p className="m-0 mt-1 text-rcn-muted text-xs font-[850]">Signed in as: {RECEIVER_CTX.receiverName}.</p>
      </div>
      <div className="flex flex-col gap-2.5 p-3 border-b border-slate-200 bg-white/90">
        <input id="q" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search patient, DOB, receiver, referral ID…" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white outline-none text-[13px] font-[850] text-rcn-text" aria-label="Search inbox" />
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
      <div className="overflow-x-auto">
        {filtered.length === 0 ? (
          <div className="py-5 px-3.5 text-center text-rcn-muted font-extrabold text-[13px]">No referrals match your filters.</div>
        ) : (
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-rcn-brand/10">
                <th className="text-left p-2.5 font-black text-[11px] uppercase tracking-wide border-b border-slate-200">Referral ID</th>
                <th className="text-left p-2.5 font-black text-[11px] uppercase border-b border-slate-200">Patient</th>
                <th className="text-left p-2.5 font-black text-[11px] uppercase border-b border-slate-200">Services</th>
                <th className="text-left p-2.5 font-black text-[11px] uppercase border-b border-slate-200">Status</th>
                <th className="text-left p-2.5 font-black text-[11px] uppercase border-b border-slate-200">Sent Date</th>
                <th className="text-left p-2.5 font-black text-[11px] uppercase border-b border-slate-200">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ref) => {
                const st = ref.receivers[0]?.status || "PENDING";
                const svc = ref.servicesRequested.slice(0, 2).join(", ") + (ref.servicesRequested.length > 2 ? ` +${ref.servicesRequested.length - 2} more` : "");
                const patientLine = `${ref.patient.last}, ${ref.patient.first} • DOB ${ref.patient.dob}`;
                return (
                  <tr key={ref.id} className="border-b border-slate-200 hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => router.push(`/staff-portal/inbox/receiver/${ref.id}`)}>
                    <td className="p-2.5 font-black text-[13px]">{ref.id}</td>
                    <td className="p-2.5 font-[850] text-[13px]">{patientLine}</td>
                    <td className="p-2.5 text-rcn-muted text-xs font-[850]">{svc || "—"}</td>
                    <td className="p-2.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-black border ${pillClass(st)}`}>{pillLabel(st)}</span>
                    </td>
                    <td className="p-2.5 text-rcn-muted text-xs font-[850]">{fmtDate(ref.sentAt)}</td>
                    <td className="p-2.5">
                      <button type="button" onClick={(e) => { e.stopPropagation(); router.push(`/staff-portal/inbox/receiver/${ref.id}`); }} className="border border-rcn-brand/25 bg-rcn-brand/10 text-rcn-accent-dark px-2 py-1.5 rounded-xl font-extrabold text-xs shadow">View</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
