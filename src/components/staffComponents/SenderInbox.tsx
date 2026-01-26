"use client";

import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import type { Referral, Company } from "@/app/staff-portal/inbox/types";
import { fmtDate, pillClass, pillLabel, overallStatus, scrollToId } from "@/app/staff-portal/inbox/helpers";
import { ForwardModal } from "./ForwardModal";
import { ChatInput } from "./ChatInput";
import { DocUploadInline } from "./DocUploadInline";

const BOX_GRAD = "linear-gradient(90deg, rgba(15,107,58,.18), rgba(31,138,76,.12), rgba(31,138,76,.06))";

interface SenderInboxProps {
  referrals: Referral[];
  setReferrals: React.Dispatch<React.SetStateAction<Referral[]>>;
  companyDirectory: Company[];
  setCompanyDirectory: React.Dispatch<React.SetStateAction<Company[]>>;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  dateFilterDays: number;
  setDateFilterDays: (d: number) => void;
  query: string;
  setQuery: (q: string) => void;
  chatReceiverSelection: Record<string, string>;
  setChatReceiverSelection: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export function SenderInbox({
  referrals,
  setReferrals,
  companyDirectory,
  setCompanyDirectory,
  selectedId,
  setSelectedId,
  statusFilter,
  setStatusFilter,
  dateFilterDays,
  setDateFilterDays,
  query,
  setQuery,
  chatReceiverSelection,
  setChatReceiverSelection,
}: SenderInboxProps) {
  const [forwardOpen, setForwardOpen] = useState(false);
  const [forwardRefId, setForwardRefId] = useState<string | null>(null);
  const [forwardSelectedCompany, setForwardSelectedCompany] = useState<Company | null>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const cutoff = new Date(Date.now() - dateFilterDays * 24 * 60 * 60 * 1000);
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

  const selected = useMemo(() => (selectedId ? filtered.find((r) => r.id === selectedId) ?? null : null), [filtered, selectedId]);
  const fullRef = selectedId ? referrals.find((r) => r.id === selectedId) : null;
  const chatReceiverId = selected ? (chatReceiverSelection[selected.id] || selected.receivers[0]?.receiverId) ?? null : null;
  const thread = fullRef && chatReceiverId ? (fullRef.chatByReceiver?.[chatReceiverId] || []) : [];

  useEffect(() => {
    if (chatBodyRef.current) chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
  }, [thread.length, selected?.id]);

  const addDoc = useCallback(
    (refId: string, name: string, type: string, fileName: string) => {
      const nm = (name || "").trim();
      if (!nm) return alert("Document name required.");
      setReferrals((prev) =>
        prev.map((r) => {
          if (r.id !== refId) return r;
          const next = { ...r, docs: [...r.docs], comms: [...r.comms, { at: new Date(), who: "Sender", msg: `Uploaded document: ${nm} (${type || "Other"}).` }] };
          next.docs.push({ name: nm, type: type || "Other", fileName: fileName || "", canDownload: true });
          return next;
        })
      );
    },
    [setReferrals]
  );

  const deleteDoc = useCallback(
    (refId: string, docIndex: number) => {
      const r = referrals.find((x) => x.id === refId);
      const doc = r?.docs[docIndex];
      if (!doc || !confirm(`Delete document: "${doc.name}" ?`)) return;
      setReferrals((prev) =>
        prev.map((x) => {
          if (x.id !== refId) return x;
          const docs = x.docs.filter((_, i) => i !== docIndex);
          return { ...x, docs, comms: [...x.comms, { at: new Date(), who: "Sender", msg: `Deleted document: ${doc.name}.` }] };
        })
      );
    },
    [referrals, setReferrals]
  );

  const sendChatMessage = useCallback(
    (refId: string, receiverId: string, text: string) => {
      const msg = (text || "").trim();
      if (!msg) return;
      setReferrals((prev) =>
        prev.map((r) => {
          if (r.id !== refId) return r;
          const chat = { ...r.chatByReceiver };
          const thread = chat[receiverId] || [];
          chat[receiverId] = [...thread, { at: new Date(), fromRole: "SENDER", fromName: "Sender", text: msg }];
          return { ...r, chatByReceiver: chat, comms: [...r.comms, { at: new Date(), who: "Sender", msg: "Chat message sent to receiver." }] };
        })
      );
    },
    [setReferrals]
  );

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
      setChatReceiverSelection((s) => ({ ...s, [refId]: rxId }));
      setForwardOpen(false);
      setTimeout(() => scrollToId("secReceivers"), 0);
    },
    [setReferrals, setChatReceiverSelection]
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

  const navBtns = [
    { id: "secBasic", label: "Basic Info" },
    { id: "secReceivers", label: "Receivers & Status" },
    { id: "secDocs", label: "Documents" },
    { id: "secAdditional", label: "Additional Info" },
    { id: "secChat", label: "Chat" },
    { id: "secLog", label: "Activity Log" },
  ];

  return (
    <>
      <div className="mt-3.5 grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-3.5 items-start">
        {/* Left: Sender list */}
        <section className="border border-slate-200 bg-white/65 rounded-2xl shadow-[0_10px_30px_rgba(2,6,23,.07)] overflow-hidden" aria-label="Sender inbox list">
          <div className="p-3.5 pt-3 pb-2.5 border-b border-slate-200 bg-white/90">
            <h2 className="m-0 text-sm font-semibold tracking-wide">Sender Inbox</h2>
            <p className="m-0 mt-1 text-rcn-muted text-xs font-[850]">Search, filter, and open a referral to view details.</p>
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
          <div className="p-2.5 flex flex-col gap-2.5 max-h-[calc(100vh-280px)] overflow-auto" role="list">
            {filtered.length === 0 && <div className="py-5 px-3.5 text-center text-rcn-muted font-extrabold text-[13px]">No referrals match your filters.</div>}
            {filtered.map((ref) => {
              const st = overallStatus(ref);
              const receiversLabel = ref.receivers.length > 1 ? `${ref.receivers.length} receivers` : ref.receivers[0]?.name ?? "";
              const svc = ref.servicesRequested.slice(0, 2).join(", ") + (ref.servicesRequested.length > 2 ? ` +${ref.servicesRequested.length - 2} more` : "");
              const patientLine = `${ref.patient.last}, ${ref.patient.first} • DOB ${ref.patient.dob}`;
              const isActive = ref.id === selectedId;
              return (
                <div key={ref.id} role="listitem" onClick={() => setSelectedId(ref.id)} className={`border rounded-2xl p-3 shadow-[0_10px_20px_rgba(2,6,23,.06)] cursor-pointer transition ${isActive ? "outline-2 outline-rcn-brand/15 border-rcn-brand/25" : "border-slate-200 bg-white hover:-translate-y-px hover:border-rcn-brand/20"}`}>
                  <div className="flex justify-between gap-2.5 items-start">
                    <div>
                      <div className="m-0 font-black text-[13px] leading-tight">{ref.id} — {patientLine}</div>
                      <div className="m-0 mt-1 text-rcn-muted text-xs font-[850]">{svc || "—"}</div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-black border ${pillClass(st)}`}>{pillLabel(st)}</span>
                  </div>
                  <div className="mt-2.5 flex gap-2 flex-wrap items-center justify-between text-rcn-muted text-xs font-[850]">
                    <span>{receiversLabel}</span>
                    <span>•</span>
                    <span>{fmtDate(ref.sentAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right: Sender detail */}
        <section className="border border-slate-200 bg-white/65 rounded-2xl shadow-[0_10px_30px_rgba(2,6,23,.07)] overflow-hidden" aria-label="Referral details">
          <div className="p-3.5 pt-3 pb-2.5 border-b border-slate-200 bg-white/90">
            <h2 className="m-0 text-sm font-semibold tracking-wide">Referral Detail</h2>
            <p className="m-0 mt-1 text-rcn-muted text-xs font-[850]">{selected ? "Sender view: all receivers + per-receiver chat. Messaging at any status." : "Select a referral from the inbox to view details."}</p>
          </div>
          <div className="p-3 overflow-auto">
            {!selected ? (
              <div className="py-5 px-3.5 text-center text-rcn-muted font-extrabold text-[13px]">Select a referral to view the detail panel.</div>
            ) : (
              <>
                <div className="flex flex-wrap gap-3 items-start justify-between p-3.5 rounded-2xl border border-rcn-brand/20 bg-white/95 shadow-[0_12px_26px_rgba(2,6,23,.07)]">
                  <div>
                    <h3 className="m-0 text-[15px] font-semibold tracking-wide">{selected.id} — {selected.patient.last}, {selected.patient.first} • DOB {selected.patient.dob} • {selected.patient.gender}</h3>
                    <p className="m-0 mt-1.5 text-rcn-muted text-xs font-[850]">Sent: {fmtDate(selected.sentAt)} • Address of Care: {selected.addressOfCare}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end">
                    <button type="button" onClick={() => window.print()} className="border border-slate-200 bg-white px-2.5 py-2 rounded-xl font-extrabold text-xs shadow">Export/Print Summary</button>
                    <button type="button" onClick={() => openForward(selected.id)} className="border border-rcn-brand/30 bg-rcn-brand/10 text-rcn-accent-dark px-2.5 py-2 rounded-xl font-extrabold text-xs shadow">Forward Referral</button>
                  </div>
                </div>

                <div className="mt-3 border border-rcn-brand/20 rounded-2xl bg-white/95 shadow-[0_12px_26px_rgba(2,6,23,.07)] p-2.5 sticky top-[86px] z-[4]" aria-label="Quick Jump Navigation">
                  <div className="flex items-center justify-between gap-2.5 mb-2">
                    <strong className="text-xs tracking-wide">Quick Jump</strong>
                    <span className="text-[11px] text-rcn-muted font-extrabold">Jump to any section</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {navBtns.map((b) => (
                      <button key={b.id} type="button" onClick={() => scrollToId(b.id)} className="inline-flex items-center gap-2 px-2.5 py-2 rounded-full border border-rcn-brand/20 bg-rcn-brand/10 text-rcn-accent-dark font-black text-xs shadow-[0_8px_16px_rgba(2,6,23,.05)] hover:border-rcn-brand/30 hover:bg-rcn-brand/10">
                        <span className="w-2.5 h-2.5 rounded-full bg-linear-to-b from-rcn-brand/85 to-rcn-brand-light/75 shadow-[0_6px_12px_rgba(15,107,58,.18)]" aria-hidden />
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-3 flex flex-col gap-3.5">
                  {/* Basic Info */}
                  <div id="secBasic" className="border border-rcn-border/60 bg-white/95 rounded-[18px] p-3.5 shadow-[0_12px_26px_rgba(2,6,23,.07)] relative overflow-hidden border-l-4 border-l-rcn-brand scroll-mt-[120px]">
                    <div className="-m-3.5 -mt-3.5 mb-3 p-3 border-b border-rcn-border/60 rounded-t-[18px] flex items-center justify-between gap-2.5" style={{ background: BOX_GRAD }}>
                      <h4 className="m-0 text-[13px] font-semibold tracking-wide flex items-center gap-2.5">
                        <span className="w-[30px] h-[30px] rounded-xl flex items-center justify-center border border-rcn-brand/25 bg-white/70 shadow">👤</span>
                        Basic Information (Always Visible)
                      </h4>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-black border border-rcn-brand/25 bg-white/70 text-rcn-accent-dark">Always Visible</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {[["Last Name", selected.patient.last], ["First Name", selected.patient.first], ["Date of Birth (DOB)", selected.patient.dob], ["Gender", selected.patient.gender], ["Address of Care", selected.addressOfCare], ["Services Requested", selected.servicesRequested.join(", ")], ["Primary Insurance", `${selected.insurance.primary.name} • Policy: ${selected.insurance.primary.policy}`], ["Additional Insurances", selected.insurance.additional?.length ? selected.insurance.additional.map((x) => `${x.name} • ${x.policy}`).join(" | ") : "None"]].map(([label, val]) => (
                        <div key={String(label)}>
                          <label className="block text-[11px] text-rcn-muted font-black mb-1">{label}</label>
                          <div className="text-[13px] font-[850] text-rcn-text leading-tight p-2.5 border border-dashed border-slate-300/75 rounded-xl bg-slate-50/55">{val || "—"}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Receivers & Status */}
                  <div id="secReceivers" className="border border-rcn-border/60 bg-white/95 rounded-[18px] p-3.5 shadow relative overflow-hidden border-l-4 border-l-rcn-brand scroll-mt-[120px]">
                    <div className="-m-3.5 -mt-3.5 mb-3 p-3 border-b border-rcn-border/60 rounded-t-[18px] flex items-center justify-between" style={{ background: BOX_GRAD }}>
                      <h4 className="m-0 text-[13px] font-semibold flex items-center gap-2.5">
                        <span className="w-[30px] h-[30px] rounded-xl flex items-center justify-center border border-rcn-brand/25 bg-white/70 shadow">📬</span>
                        Receivers & Status
                      </h4>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-black border border-rcn-brand/25 bg-white/70 text-rcn-accent-dark">Message at any status</span>
                    </div>
                    <div className="overflow-hidden rounded-[14px] border border-slate-200 bg-white">
                      <table className="w-full border-collapse text-xs">
                        <thead>
                          <tr>
                            <th className="text-left p-2.5 bg-rcn-brand/10 text-rcn-text font-black text-[11px] uppercase tracking-wide">Receiver</th>
                            <th className="text-left p-2.5 bg-rcn-brand/10 font-black text-[11px] uppercase">Status</th>
                            <th className="text-left p-2.5 bg-rcn-brand/10 font-black text-[11px] uppercase">Last Update</th>
                            <th className="text-left p-2.5 bg-rcn-brand/10 font-black text-[11px] uppercase">Payment</th>
                            <th className="text-left p-2.5 bg-rcn-brand/10 font-black text-[11px] uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selected.receivers.map((rx) => (
                            <tr key={rx.receiverId} className="border-t border-slate-200">
                              <td className="p-2.5 align-top">
                                <strong>{rx.name}</strong>
                                {rx.email && <div className="text-rcn-muted text-xs">{rx.email}</div>}
                                {rx.status === "REJECTED" && rx.rejectReason && <div className="text-rcn-muted text-xs">Reason: {rx.rejectReason}</div>}
                                {rx.servicesRequestedOverride?.length && <div className="text-rcn-muted text-xs">Services override: {rx.servicesRequestedOverride.join(", ")}</div>}
                              </td>
                              <td className="p-2.5"><span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-black border ${pillClass(rx.status)}`}>{pillLabel(rx.status)}</span></td>
                              <td className="p-2.5">{fmtDate(rx.updatedAt)}</td>
                              <td className="p-2.5">{rx.paidUnlocked ? <span className={`inline-flex px-2.5 py-1.5 rounded-full text-[11px] font-black border ${pillClass("PAID")}`}>Paid</span> : <span className={`inline-flex px-2.5 py-1.5 rounded-full text-[11px] font-black border ${pillClass("PENDING")}`}>Not paid</span>}</td>
                              <td className="p-2.5">
                                <button type="button" onClick={() => { setChatReceiverSelection((s) => ({ ...s, [selected.id]: rx.receiverId })); setTimeout(() => scrollToId("secChat"), 0); }} className="border border-rcn-brand/25 bg-rcn-brand/10 text-rcn-accent-dark px-2 py-1.5 rounded-xl font-extrabold text-xs shadow mr-1">Chat</button>
                                <button type="button" onClick={() => alert(`Demo: reminder sent to ${rx.name}`)} className="border border-slate-200 bg-white px-2 py-1.5 rounded-xl font-extrabold text-xs shadow">Reminder</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Documents */}
                  <div id="secDocs" className="border border-rcn-border/60 bg-white/95 rounded-[18px] p-3.5 shadow relative overflow-hidden border-l-4 border-l-rcn-brand scroll-mt-[120px]">
                    <div className="-m-3.5 -mt-3.5 mb-3 p-3 border-b border-rcn-border/60 rounded-t-[18px] flex items-center justify-between" style={{ background: BOX_GRAD }}>
                      <h4 className="m-0 text-[13px] font-semibold flex items-center gap-2.5">
                        <span className="w-[30px] h-[30px] rounded-xl flex items-center justify-center border border-rcn-brand/25 bg-white/70 shadow">📎</span>
                        Attached Documents (From Sender)
                      </h4>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-black border border-rcn-brand/25 bg-white/70 text-rcn-accent-dark">Downloadable</span>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-3 align-top">
                      <div className="overflow-hidden rounded-[14px] border border-slate-200 bg-white">
                        {selected.docs?.length ? (
                          <table className="w-full border-collapse text-xs">
                            <thead>
                              <tr>
                                <th className="text-left p-2.5 bg-rcn-brand/10 font-black text-[11px] uppercase">Document</th>
                                <th className="text-left p-2.5 bg-rcn-brand/10 font-black text-[11px] uppercase">Type</th>
                                <th className="text-left p-2.5 bg-rcn-brand/10 font-black text-[11px] uppercase">Download</th>
                                <th className="text-left p-2.5 bg-rcn-brand/10 font-black text-[11px] uppercase">Manage</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selected.docs.map((d, idx) => (
                                <tr key={idx} className="border-t border-slate-200">
                                  <td className="p-2.5"><strong>{d.name}</strong>{d.fileName && <div className="text-rcn-muted text-xs">File: {d.fileName}</div>}</td>
                                  <td className="p-2.5">{d.type}</td>
                                  <td className="p-2.5"><button type="button" onClick={() => alert(`Demo: download ${d.name}`)} className="border border-slate-200 bg-white px-2 py-1.5 rounded-xl text-xs font-extrabold shadow">Download</button></td>
                                  <td className="p-2.5"><button type="button" onClick={() => deleteDoc(selected.id, idx)} className="border border-red-200 bg-red-50 text-red-700 px-2 py-1.5 rounded-xl text-xs font-extrabold shadow">Delete</button></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <div className="p-3 text-rcn-muted text-sm">No documents attached.</div>
                        )}
                      </div>
                      <DocUploadInline refId={selected.id} onAdd={addDoc} />
                    </div>
                  </div>

                  {/* Additional Info (always visible for sender) */}
                  <div id="secAdditional" className="border border-rcn-border/60 bg-white/95 rounded-[18px] p-3.5 shadow relative overflow-hidden border-l-4 border-l-rcn-brand scroll-mt-[120px]">
                    <div className="-m-3.5 -mt-3.5 mb-3 p-3 border-b border-rcn-border/60 rounded-t-[18px] flex items-center justify-between" style={{ background: BOX_GRAD }}>
                      <h4 className="m-0 text-[13px] font-semibold flex items-center gap-2.5">
                        <span className="w-[30px] h-[30px] rounded-xl flex items-center justify-center border border-rcn-brand/25 bg-white/70 shadow">🔒</span>
                        Additional Patient Information
                      </h4>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-black border border-rcn-brand/25 bg-white/70 text-rcn-accent-dark">Visible Once Payment Is Completed</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {[["Phone Number (Must)", selected.additionalPatientInfo.phone], ["Primary Language", selected.additionalPatientInfo.language], ["Representative / Power of Attorney", selected.additionalPatientInfo.rep], ["Social Security Number", selected.additionalPatientInfo.ssn], ["Other Information", selected.additionalPatientInfo.otherInfo || "—"]].map(([label, val], i) => (
                        <div key={i} className={i === 4 ? "sm:col-span-2" : ""}>
                          <label className="block text-[11px] text-rcn-muted font-black mb-1">{label}</label>
                          <div className="text-[13px] font-[850] text-rcn-text leading-tight p-2.5 border border-dashed border-slate-300/75 rounded-xl bg-slate-50/55">{val}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Chat */}
                  <div id="secChat" className="border border-rcn-border/60 bg-white/95 rounded-[18px] p-3.5 shadow relative overflow-hidden border-l-4 border-l-rcn-brand scroll-mt-[120px]">
                    <div className="-m-3.5 -mt-3.5 mb-3 p-3 border-b border-rcn-border/60 rounded-t-[18px] flex items-center justify-between" style={{ background: BOX_GRAD }}>
                      <h4 className="m-0 text-[13px] font-semibold flex items-center gap-2.5">
                        <span className="w-[30px] h-[30px] rounded-xl flex items-center justify-center border border-rcn-brand/25 bg-white/70 shadow">💬</span>
                        Chat with Receiver
                      </h4>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-black border border-rcn-brand/25 bg-white/70 text-rcn-accent-dark">Messaging Enabled</span>
                    </div>
                    <div className="border border-rcn-brand/20 rounded-[14px] bg-rcn-brand/5 overflow-hidden">
                      <div className="flex gap-2.5 items-center justify-between p-2.5 bg-rcn-brand/10 border-b border-rcn-brand/20">
                        <span className="text-rcn-muted text-xs font-black">Thread</span>
                        {selected.receivers.length > 1 ? (
                          <select value={chatReceiverId || ""} onChange={(e) => setChatReceiverSelection((s) => ({ ...s, [selected.id]: e.target.value }))} className="min-w-[220px] border border-slate-200 bg-white rounded-xl py-2 px-2.5 text-xs font-[850] outline-none" aria-label="Select receiver chat thread">
                            {selected.receivers.map((rx) => (
                              <option key={rx.receiverId} value={rx.receiverId}>{rx.name}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-rcn-muted text-xs">{selected.receivers[0]?.name ?? "—"}</span>
                        )}
                      </div>
                      <div ref={chatBodyRef} className="max-h-[280px] overflow-auto p-2.5 flex flex-col gap-2.5">
                        {thread.length ? (
                          [...thread]
                            .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
                            .map((m, i) => {
                              const mine = m.fromRole === "SENDER";
                              return (
                                <div key={i} className={`flex gap-2.5 items-end ${mine ? "justify-end" : ""}`}>
                                  <div className={`max-w-[78%] border rounded-[14px] p-2.5 shadow-[0_8px_18px_rgba(2,6,23,.06)] ${mine ? "bg-rcn-brand/10 border-rcn-brand/20" : "border-slate-200 bg-white"}`}>
                                    <div className="text-[11px] text-rcn-muted font-black mb-1 flex gap-2 flex-wrap justify-between">{m.fromName} <span>{fmtDate(m.at)}</span></div>
                                    <div className="text-[13px] font-[850] text-rcn-text leading-snug whitespace-pre-wrap">{m.text}</div>
                                  </div>
                                </div>
                              );
                            })
                        ) : (
                          <div className="p-2 text-rcn-muted font-black text-sm">No messages yet. Start the chat below.</div>
                        )}
                      </div>
                      <ChatInput selected={selected} chatReceiverId={chatReceiverId} onSend={(rid, t) => sendChatMessage(selected.id, rid, t)} role="SENDER" />
                    </div>
                  </div>

                  {/* Activity Log */}
                  <div id="secLog" className="border border-rcn-border/60 bg-white/95 rounded-[18px] p-3.5 shadow relative overflow-hidden border-l-4 border-l-rcn-brand scroll-mt-[120px]">
                    <div className="-m-3.5 -mt-3.5 mb-3 p-3 border-b border-rcn-border/60 rounded-t-[18px] flex items-center justify-between" style={{ background: BOX_GRAD }}>
                      <h4 className="m-0 text-[13px] font-semibold flex items-center gap-2.5">
                        <span className="w-[30px] h-[30px] rounded-xl flex items-center justify-center border border-rcn-brand/25 bg-white/70 shadow">🕒</span>
                        Communication & Activity Log
                      </h4>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-black border border-rcn-brand/25 bg-white/70 text-rcn-accent-dark">Audit Trail</span>
                    </div>
                    {selected.comms?.length ? (
                      <div className="overflow-hidden rounded-[14px] border border-slate-200 bg-white">
                        <table className="w-full border-collapse text-xs">
                          <thead><tr><th className="text-left p-2.5 bg-rcn-brand/10 font-black text-[11px] uppercase">Time</th><th className="text-left p-2.5 bg-rcn-brand/10 font-black text-[11px] uppercase">Who</th><th className="text-left p-2.5 bg-rcn-brand/10 font-black text-[11px] uppercase">Message</th></tr></thead>
                          <tbody>
                            {[...selected.comms].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).map((c, i) => (
                              <tr key={i} className="border-t border-slate-200">
                                <td className="p-2.5">{fmtDate(c.at)}</td>
                                <td className="p-2.5"><strong>{c.who}</strong></td>
                                <td className="p-2.5">{c.msg}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-rcn-muted font-black text-sm">No activity yet.</div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </div>

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
