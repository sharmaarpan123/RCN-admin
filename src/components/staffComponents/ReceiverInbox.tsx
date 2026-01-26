"use client";

import React, { useCallback, useMemo, useRef, useEffect } from "react";
import { RECEIVER_CTX } from "@/app/staff-portal/inbox/demo-data";
import { fmtDate, pillClass, pillLabel, scrollToId } from "@/app/staff-portal/inbox/helpers";
import type { Referral } from "@/app/staff-portal/inbox/types";
import { ChatInput } from "./ChatInput";

const BOX_GRAD = "linear-gradient(90deg, rgba(15,107,58,.18), rgba(31,138,76,.12), rgba(31,138,76,.06))";

interface ReceiverInboxProps {
  referrals: Referral[];
  setReferrals: React.Dispatch<React.SetStateAction<Referral[]>>;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  dateFilterDays: number;
  setDateFilterDays: (d: number) => void;
  query: string;
  setQuery: (q: string) => void;
}

export function ReceiverInbox({
  referrals,
  setReferrals,
  selectedId,
  setSelectedId,
  statusFilter,
  setStatusFilter,
  dateFilterDays,
  setDateFilterDays,
  query,
  setQuery,
}: ReceiverInboxProps) {
  const chatBodyRef = useRef<HTMLDivElement>(null);

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
    const cutoff = new Date(Date.now() - dateFilterDays * 24 * 60 * 60 * 1000);
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

  const selected = useMemo(() => (selectedId ? filtered.find((r) => r.id === selectedId) ?? null : null), [filtered, selectedId]);
  const fullRef = selectedId ? referrals.find((r) => r.id === selectedId) : null;
  const thread = fullRef ? (fullRef.chatByReceiver?.[RECEIVER_CTX.receiverId] || []) : [];

  useEffect(() => {
    if (chatBodyRef.current) chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
  }, [thread.length, selected?.id]);

  const receiverSetStatus = useCallback(
    (refId: string, status: string) => {
      setReferrals((prev) =>
        prev.map((r) => {
          if (r.id !== refId) return r;
          const inst = r.receivers.find((rx) => rx.receiverId === RECEIVER_CTX.receiverId);
          if (!inst) return r;
          const receivers = r.receivers.map((rx) => (rx.receiverId === RECEIVER_CTX.receiverId ? { ...rx, status, updatedAt: new Date() } : rx));
          return { ...r, receivers, comms: [...r.comms, { at: new Date(), who: RECEIVER_CTX.receiverName, msg: `Status changed: ${status}` }] };
        })
      );
    },
    [setReferrals]
  );

  const receiverReject = useCallback(
    (refId: string) => {
      const reason = prompt("Rejection reason (optional):", "Not a fit / Out of service area") ?? "";
      setReferrals((prev) =>
        prev.map((r) => {
          if (r.id !== refId) return r;
          const inst = r.receivers.find((rx) => rx.receiverId === RECEIVER_CTX.receiverId);
          if (!inst) return r;
          const receivers = r.receivers.map((rx) =>
            rx.receiverId === RECEIVER_CTX.receiverId ? { ...rx, status: "REJECTED", rejectReason: reason.trim(), updatedAt: new Date() } : rx
          );
          return { ...r, receivers, comms: [...r.comms, { at: new Date(), who: RECEIVER_CTX.receiverName, msg: `Rejected${reason.trim() ? ": " + reason.trim() : ""}.` }] };
        })
      );
    },
    [setReferrals]
  );

  const receiverPayUnlock = useCallback(
    (refId: string) => {
      if (!confirm("Demo: Pay service fee to unlock additional patient info?")) return;
      setReferrals((prev) =>
        prev.map((r) => {
          if (r.id !== refId) return r;
          const receivers = r.receivers.map((rx) =>
            rx.receiverId === RECEIVER_CTX.receiverId ? { ...rx, status: "PAID", paidUnlocked: true, updatedAt: new Date() } : rx
          );
          return { ...r, receivers, comms: [...r.comms, { at: new Date(), who: "System", msg: "Receiver paid and unlocked additional info." }] };
        })
      );
    },
    [setReferrals]
  );

  const sendChatMessage = useCallback(
    (refId: string, _receiverId: string, text: string) => {
      const msg = (text || "").trim();
      if (!msg) return;
      setReferrals((prev) =>
        prev.map((r) => {
          if (r.id !== refId) return r;
          const chat = { ...r.chatByReceiver };
          const thread = chat[RECEIVER_CTX.receiverId] || [];
          chat[RECEIVER_CTX.receiverId] = [...thread, { at: new Date(), fromRole: "RECEIVER", fromName: RECEIVER_CTX.receiverName, text: msg }];
          return { ...r, chatByReceiver: chat, comms: [...r.comms, { at: new Date(), who: RECEIVER_CTX.receiverName, msg: "Chat message sent to sender." }] };
        })
      );
    },
    [setReferrals]
  );

  const navBtns = [
    { id: "secBasic", label: "Basic Info" },
    { id: "secDocs", label: "Documents" },
    { id: "secAdditional", label: "Additional Info" },
    { id: "secChat", label: "Chat" },
    { id: "secLog", label: "Activity Log" },
  ];

  return (
    <div className="mt-3.5 grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-3.5 items-start">
      {/* Left: Receiver list */}
      <section className="border border-slate-200 bg-white/65 rounded-2xl shadow-[0_10px_30px_rgba(2,6,23,.07)] overflow-hidden" aria-label="Receiver inbox list">
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
        <div className="p-2.5 flex flex-col gap-2.5 max-h-[calc(100vh-280px)] overflow-auto" role="list">
          {filtered.length === 0 && <div className="py-5 px-3.5 text-center text-rcn-muted font-extrabold text-[13px]">No referrals match your filters.</div>}
          {filtered.map((ref) => {
            const st = ref.receivers[0]?.status || "PENDING";
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
                  <span>{RECEIVER_CTX.receiverName}</span>
                  <span>•</span>
                  <span>{fmtDate(ref.sentAt)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Right: Receiver detail */}
      <section className="border border-slate-200 bg-white/65 rounded-2xl shadow-[0_10px_30px_rgba(2,6,23,.07)] overflow-hidden" aria-label="Referral details">
        <div className="p-3.5 pt-3 pb-2.5 border-b border-slate-200 bg-white/90">
          <h2 className="m-0 text-sm font-semibold tracking-wide">Referral Detail</h2>
          <p className="m-0 mt-1 text-rcn-muted text-xs font-[850]">{selected ? "Receiver view: your copy + chat with sender." : "Select a referral from the inbox to view details."}</p>
        </div>
        <div className="p-3 overflow-auto">
          {!selected ? (
            <div className="py-5 px-3.5 text-center text-rcn-muted font-extrabold text-[13px]">Select a referral to view the detail panel.</div>
          ) : (() => {
            const inst = selected.receivers[0];
            const receiverStatus = inst?.status || "PENDING";
            const isUnlocked = receiverStatus === "PAID" || receiverStatus === "COMPLETED";
            const servicesForDisplay = inst?.servicesRequestedOverride?.length ? (inst.servicesRequestedOverride || []) : selected.servicesRequested;

            const rxControls =
              receiverStatus === "PENDING"
                ? [<button key="a" type="button" onClick={() => receiverSetStatus(selected.id, "ACCEPTED")} className="border border-rcn-brand/30 bg-rcn-brand/10 text-rcn-accent-dark px-2.5 py-2 rounded-xl font-extrabold text-xs shadow">Accept</button>, <button key="r" type="button" onClick={() => receiverReject(selected.id)} className="border border-red-200 bg-red-50 text-red-700 px-2.5 py-2 rounded-xl font-extrabold text-xs shadow">Reject</button>]
                : receiverStatus === "ACCEPTED"
                  ? [<button key="p" type="button" onClick={() => receiverPayUnlock(selected.id)} className="border border-rcn-brand/25 bg-rcn-brand/10 text-rcn-accent-dark px-2.5 py-2 rounded-xl font-extrabold text-xs shadow">Pay & Unlock</button>, <button key="r2" type="button" onClick={() => receiverReject(selected.id)} className="border border-red-200 bg-red-50 text-red-700 px-2.5 py-2 rounded-xl font-extrabold text-xs shadow">Reject</button>]
                  : receiverStatus === "PAID"
                    ? [<span key="paid" className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-black border ${pillClass("PAID")}`}>Paid/Unlocked</span>]
                    : receiverStatus === "REJECTED"
                      ? [<span key="rej" className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-black border ${pillClass("REJECTED")}`}>Rejected</span>]
                      : [<button key="r3" type="button" onClick={() => receiverReject(selected.id)} className="border border-red-200 bg-red-50 text-red-700 px-2.5 py-2 rounded-xl font-extrabold text-xs shadow">Reject</button>];

            return (
              <>
                <div className="flex flex-wrap gap-3 items-start justify-between p-3.5 rounded-2xl border border-rcn-brand/20 bg-white/95 shadow-[0_12px_26px_rgba(2,6,23,.07)]">
                  <div>
                    <h3 className="m-0 text-[15px] font-semibold tracking-wide">{selected.id} — {selected.patient.last}, {selected.patient.first} • DOB {selected.patient.dob} • {selected.patient.gender}</h3>
                    <p className="m-0 mt-1.5 text-rcn-muted text-xs font-[850]">Sent: {fmtDate(selected.sentAt)} • Address of Care: {selected.addressOfCare}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end">{rxControls}</div>
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
                      {[["Last Name", selected.patient.last], ["First Name", selected.patient.first], ["Date of Birth (DOB)", selected.patient.dob], ["Gender", selected.patient.gender], ["Address of Care", selected.addressOfCare], ["Services Requested", servicesForDisplay.join(", ")], ["Primary Insurance", `${selected.insurance.primary.name} • Policy: ${selected.insurance.primary.policy}`], ["Additional Insurances", selected.insurance.additional?.length ? selected.insurance.additional.map((x) => `${x.name} • ${x.policy}`).join(" | ") : "None"]].map(([label, val]) => (
                        <div key={String(label)}>
                          <label className="block text-[11px] text-rcn-muted font-black mb-1">{label}</label>
                          <div className="text-[13px] font-[850] text-rcn-text leading-tight p-2.5 border border-dashed border-slate-300/75 rounded-xl bg-slate-50/55">{val || "—"}</div>
                        </div>
                      ))}
                    </div>
                    {receiverStatus === "PENDING" && (
                      <div className="mt-3 flex gap-2.5 flex-wrap justify-end">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-black border ${pillClass("PENDING")}`}>Decision point: Accept or Reject</span>
                      </div>
                    )}
                  </div>

                  {/* Documents (read-only) */}
                  <div id="secDocs" className="border border-rcn-border/60 bg-white/95 rounded-[18px] p-3.5 shadow relative overflow-hidden border-l-4 border-l-rcn-brand scroll-mt-[120px]">
                    <div className="-m-3.5 -mt-3.5 mb-3 p-3 border-b border-rcn-border/60 rounded-t-[18px] flex items-center justify-between" style={{ background: BOX_GRAD }}>
                      <h4 className="m-0 text-[13px] font-semibold flex items-center gap-2.5">
                        <span className="w-[30px] h-[30px] rounded-xl flex items-center justify-center border border-rcn-brand/25 bg-white/70 shadow">📎</span>
                        Attached Documents (From Sender)
                      </h4>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-black border border-rcn-brand/25 bg-white/70 text-rcn-accent-dark">Downloadable</span>
                    </div>
                    {selected.docs?.length ? (
                      <div className="overflow-hidden rounded-[14px] border border-slate-200 bg-white">
                        <table className="w-full border-collapse text-xs">
                          <thead>
                            <tr>
                              <th className="text-left p-2.5 bg-rcn-brand/10 font-black text-[11px] uppercase">Document</th>
                              <th className="text-left p-2.5 bg-rcn-brand/10 font-black text-[11px] uppercase">Type</th>
                              <th className="text-left p-2.5 bg-rcn-brand/10 font-black text-[11px] uppercase">Download</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selected.docs.map((d, idx) => (
                              <tr key={idx} className="border-t border-slate-200">
                                <td className="p-2.5"><strong>{d.name}</strong>{d.fileName && <div className="text-rcn-muted text-xs">File: {d.fileName}</div>}</td>
                                <td className="p-2.5">{d.type}</td>
                                <td className="p-2.5"><button type="button" onClick={() => alert(`Demo: download ${d.name}`)} className="border border-slate-200 bg-white px-2 py-1.5 rounded-xl text-xs font-extrabold shadow">Download</button></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-3 text-rcn-muted text-sm">No documents attached.</div>
                    )}
                    <div className="mt-3 border border-dashed border-rcn-brand/35 rounded-[14px] bg-rcn-brand/5 p-3">
                      <div className="flex justify-between gap-2.5 mb-2.5">
                        <strong className="text-xs">Upload Documents</strong>
                        <span className="text-[11px] text-rcn-muted font-black">Sender Only</span>
                      </div>
                      <div className="text-rcn-muted text-xs">Sender uploads documents. All documents on the left are downloadable.</div>
                    </div>
                  </div>

                  {/* Additional Info (lock until paid) */}
                  <div id="secAdditional" className="border border-rcn-border/60 bg-white/95 rounded-[18px] p-3.5 shadow relative overflow-hidden border-l-4 border-l-rcn-brand scroll-mt-[120px]">
                    <div className="-m-3.5 -mt-3.5 mb-3 p-3 border-b border-rcn-border/60 rounded-t-[18px] flex items-center justify-between" style={{ background: BOX_GRAD }}>
                      <h4 className="m-0 text-[13px] font-semibold flex items-center gap-2.5">
                        <span className="w-[30px] h-[30px] rounded-xl flex items-center justify-center border border-rcn-brand/25 bg-white/70 shadow">🔒</span>
                        Additional Patient Information
                      </h4>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-black border border-rcn-brand/25 bg-white/70 text-rcn-accent-dark">
                        {isUnlocked ? "Payment Completed — Visible" : "Visible Once Payment Is Completed"}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {[["Phone Number (Must)", selected.additionalPatientInfo.phone], ["Primary Language", selected.additionalPatientInfo.language], ["Representative / Power of Attorney", selected.additionalPatientInfo.rep], ["Social Security Number", selected.additionalPatientInfo.ssn], ["Other Information", selected.additionalPatientInfo.otherInfo || "—"]].map(([label, val], i) => (
                        <div key={i} className={i === 4 ? "sm:col-span-2" : ""}>
                          <label className="block text-[11px] text-rcn-muted font-black mb-1">{label}</label>
                          <div className="text-[13px] font-[850] text-rcn-text leading-tight p-2.5 border border-dashed border-slate-300/75 rounded-xl bg-slate-50/55">{val}</div>
                        </div>
                      ))}
                    </div>
                    {!isUnlocked && (
                      <div className="absolute inset-0 rounded-[18px] bg-slate-900/45 flex items-center justify-center p-4">
                        <div className="w-full max-w-[520px] rounded-2xl bg-white/95 border border-slate-200 shadow-[0_20px_50px_rgba(2,6,23,.25)] p-3.5">
                          <h5 className="m-0 text-[13px] font-semibold">Locked: Additional Patient Information</h5>
                          <p className="m-0 mt-1.5 mb-3 text-rcn-muted text-xs font-[850]">To view these fields, payment is required. You can reject anytime.</p>
                          <div className="flex gap-2.5 flex-wrap justify-end">
                            {receiverStatus === "ACCEPTED" && <button type="button" onClick={() => receiverPayUnlock(selected.id)} className="border border-rcn-brand/25 bg-rcn-brand/10 text-rcn-accent-dark px-2.5 py-2 rounded-xl font-extrabold text-xs shadow">Pay & Unlock</button>}
                            <button type="button" onClick={() => receiverReject(selected.id)} className="border border-red-200 bg-red-50 text-red-700 px-2.5 py-2 rounded-xl font-extrabold text-xs shadow">Reject</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Chat */}
                  <div id="secChat" className="border border-rcn-border/60 bg-white/95 rounded-[18px] p-3.5 shadow relative overflow-hidden border-l-4 border-l-rcn-brand scroll-mt-[120px]">
                    <div className="-m-3.5 -mt-3.5 mb-3 p-3 border-b border-rcn-border/60 rounded-t-[18px] flex items-center justify-between" style={{ background: BOX_GRAD }}>
                      <h4 className="m-0 text-[13px] font-semibold flex items-center gap-2.5">
                        <span className="w-[30px] h-[30px] rounded-xl flex items-center justify-center border border-rcn-brand/25 bg-white/70 shadow">💬</span>
                        Chat with Sender
                      </h4>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-black border border-rcn-brand/25 bg-white/70 text-rcn-accent-dark">Messaging Enabled</span>
                    </div>
                    <div className="border border-rcn-brand/20 rounded-[14px] bg-rcn-brand/5 overflow-hidden">
                      <div className="flex gap-2.5 items-center justify-between p-2.5 bg-rcn-brand/10 border-b border-rcn-brand/20">
                        <span className="text-rcn-muted text-xs font-black">Thread</span>
                        <span className="text-rcn-muted text-xs">Sender</span>
                      </div>
                      <div ref={chatBodyRef} className="max-h-[280px] overflow-auto p-2.5 flex flex-col gap-2.5">
                        {thread.length ? (
                          [...thread]
                            .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
                            .map((m, i) => {
                              const mine = m.fromRole === "RECEIVER";
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
                      <ChatInput selected={selected} chatReceiverId={RECEIVER_CTX.receiverId} onSend={(rid, t) => sendChatMessage(selected.id, rid, t)} role="RECEIVER" />
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
            );
          })()}
        </div>
      </section>
    </div>
  );
}
