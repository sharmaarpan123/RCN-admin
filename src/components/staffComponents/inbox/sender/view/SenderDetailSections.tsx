"use client";

import React, { RefObject } from "react";
import { fmtDate, pillClass, pillLabel, scrollToId } from "@/app/staff-portal/inbox/helpers";
import type { ReferralByIdApi, ReceiverInstance, ChatMsg, Comm } from "@/app/staff-portal/inbox/types";
import { ChatInput } from "./ChatInput";
import { DocUploadInline } from "./DocUploadInline";
import { BOX_GRAD } from "./senderViewHelpers";
import type { DocRow } from "./senderViewHelpers";

interface SenderDetailSectionsProps {
  data: ReferralByIdApi;
  overlayComms: Comm[];
  refId: string;
  allReceivers: ReceiverInstance[];
  chatReceiverId: string | null;
  thread: ChatMsg[];
  chatBodyRef: RefObject<HTMLDivElement | null>;
  displayDocRows: DocRow[];
  setChatReceiverSelection: (fn: (s: Record<string, string>) => Record<string, string>) => void;
  openDeleteDocModal: (kind: "api" | "local", label: string, index: number) => void;
  addDoc: (refId: string, name: string, type: string, fileName: string) => void;
  sendChatMessage: (receiverId: string, text: string) => void;
  chatInputSelected: { receivers: ReceiverInstance[] };
}

export function SenderDetailSections({
  data,
  overlayComms,
  refId,
  allReceivers,
  chatReceiverId,
  thread,
  chatBodyRef,
  displayDocRows,
  setChatReceiverSelection,
  openDeleteDocModal,
  addDoc,
  sendChatMessage,
  chatInputSelected,
}: SenderDetailSectionsProps) {
  const p = data.patient ?? {};
  const ins = data.patient_insurance_information ?? [];
  const primary = ins[0];
  const addPatient = (data.additional_patient ?? {}) as Record<string, string>;

  return (
    <div className="flex flex-col gap-3.5">
      <div id="secBasic" className="border border-rcn-border/60 bg-white/95 rounded-[18px] p-3.5 shadow-[0_12px_26px_rgba(2,6,23,.07)] relative overflow-hidden border-l-4 border-l-rcn-brand scroll-mt-[120px]">
        <div className="-m-3.5 -mt-3.5 mb-3 p-3 border-b border-rcn-border/60 rounded-t-[18px] flex items-center justify-between gap-2.5" style={{ background: BOX_GRAD }}>
          <h4 className="m-0 text-[13px] font-semibold tracking-wide flex items-center gap-2.5">
            <span className="w-[30px] h-[30px] rounded-xl flex items-center justify-center border border-rcn-brand/25 bg-white/70 shadow">👤</span>
            Basic Information
          </h4>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-black border border-rcn-brand/25 bg-white/70 text-rcn-accent-dark">Always Visible</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[
            ["Last Name", p.patient_last_name],
            ["First Name", p.patient_first_name],
            ["Date of Birth (DOB)", p.dob],
            ["Gender", p.gender],
            ["Address of Care", p.address_of_care],
            ["Services Requested", (data.speciality_ids ?? []).join(", ")],
            ["Primary Insurance", primary ? `${primary.payer ?? ""} • Policy: ${primary.policy ?? ""}` : ""],
            ["Additional Insurances", ins.length > 1 ? ins.slice(1).map((x) => `${x.payer ?? ""} • ${x.policy ?? ""}`).join(" | ") : "None"],
          ].map(([label, val]) => (
            <div key={String(label)}>
              <label className="block text-[11px] text-rcn-muted font-black mb-1">{label}</label>
              <div className="text-[13px] font-[850] text-rcn-text leading-tight p-2.5 border border-dashed border-slate-300/75 rounded-xl bg-slate-50/55">{val ?? "—"}</div>
            </div>
          ))}
        </div>
      </div>

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
              {allReceivers.map((rx) => (
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
                    <button type="button" onClick={() => { setChatReceiverSelection((s) => ({ ...s, [refId]: rx.receiverId })); setTimeout(() => scrollToId("secChat"), 0); }} className="border border-rcn-brand/25 bg-rcn-brand/10 text-rcn-accent-dark px-2 py-1.5 rounded-xl font-extrabold text-xs shadow mr-1">Chat</button>
                    <button type="button" onClick={() => alert(`Demo: reminder sent to ${rx.name}`)} className="border border-slate-200 bg-white px-2 py-1.5 rounded-xl font-extrabold text-xs shadow">Reminder</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div id="secDocs" className="border border-rcn-border/60 bg-white/95 rounded-[18px] p-3.5 shadow relative overflow-hidden border-l-4 border-l-rcn-brand scroll-mt-[120px]">
        <div className="-m-3.5 -mt-3.5 mb-3 p-3 border-b border-rcn-border/60 rounded-t-[18px] flex items-center justify-between" style={{ background: BOX_GRAD }}>
          <h4 className="m-0 text-[13px] font-semibold flex items-center gap-2.5">
            <span className="w-[30px] h-[30px] rounded-xl flex items-center justify-center border border-rcn-brand/25 bg-white/70 shadow">📎</span>
            Attached Documents
          </h4>
        </div>
        <div className="gap-3 align-top">
          <div className="overflow-hidden rounded-[14px] border border-slate-200 bg-white">
            {displayDocRows.length > 0 ? (
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
                  {displayDocRows.map((d, idx) => (
                    <tr key={idx} className="border-t border-slate-200">
                      <td className="p-2.5"><strong>{d.label}</strong>{d.url && <div className="text-rcn-muted text-xs">File: {d.url}</div>}</td>
                      <td className="p-2.5">{d.type}</td>
                      <td className="p-2.5"><button type="button" onClick={() => alert(`Demo: download ${d.label}`)} className="border border-slate-200 bg-white px-2 py-1.5 rounded-xl text-xs font-extrabold shadow">Download</button></td>
                      <td className="p-2.5"><button type="button" onClick={() => openDeleteDocModal(d.kind, d.label, d.localIndex ?? 0)} className="border border-red-200 bg-red-50 text-red-700 px-2 py-1.5 rounded-xl text-xs font-extrabold shadow">Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-3 text-rcn-muted text-sm">No documents attached.</div>
            )}
          </div>
         
        </div>
      </div>

      <div id="secAdditional" className="border border-rcn-border/60 bg-white/95 rounded-[18px] p-3.5 shadow relative overflow-hidden border-l-4 border-l-rcn-brand scroll-mt-[120px]">
        <div className="-m-3.5 -mt-3.5 mb-3 p-3 border-b border-rcn-border/60 rounded-t-[18px] flex items-center justify-between" style={{ background: BOX_GRAD }}>
          <h4 className="m-0 text-[13px] font-semibold flex items-center gap-2.5">
            <span className="w-[30px] h-[30px] rounded-xl flex items-center justify-center border border-rcn-brand/25 bg-white/70 shadow">🔒</span>
            Additional Patient Information
          </h4>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-black border border-rcn-brand/25 bg-white/70 text-rcn-accent-dark">Visible Once Payment Is Completed</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[
            ["Phone Number (Must)", addPatient.phone_number],
            ["Primary Language", addPatient.primary_language],
            ["Representative / Power of Attorney", addPatient.power_of_attorney],
            ["Social Security Number", addPatient.social_security_number],
            ["Other Information", addPatient.other_information ?? "—"],
          ].map(([label, val], i) => (
            <div key={i} className={i === 4 ? "sm:col-span-2" : ""}>
              <label className="block text-[11px] text-rcn-muted font-black mb-1">{label}</label>
              <div className="text-[13px] font-[850] text-rcn-text leading-tight p-2.5 border border-dashed border-slate-300/75 rounded-xl bg-slate-50/55">{val ?? "—"}</div>
            </div>
          ))}
        </div>
      </div>

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
            {allReceivers.length > 1 ? (
              <select value={chatReceiverId ?? ""} onChange={(e) => setChatReceiverSelection((s) => ({ ...s, [refId]: e.target.value }))} className="min-w-[220px] border border-slate-200 bg-white rounded-xl py-2 px-2.5 text-xs font-normal outline-none" aria-label="Select receiver chat thread">
                {allReceivers.map((rx) => (
                  <option key={rx.receiverId} value={rx.receiverId}>{rx.name}</option>
                ))}
              </select>
            ) : (
              <span className="text-rcn-muted text-xs">{allReceivers[0]?.name ?? "—"}</span>
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
          <ChatInput selected={chatInputSelected} chatReceiverId={chatReceiverId} onSend={sendChatMessage} role="SENDER" />
        </div>
      </div>

      <div id="secLog" className="border border-rcn-border/60 bg-white/95 rounded-[18px] p-3.5 shadow relative overflow-hidden border-l-4 border-l-rcn-brand scroll-mt-[120px]">
        <div className="-m-3.5 -mt-3.5 mb-3 p-3 border-b border-rcn-border/60 rounded-t-[18px] flex items-center justify-between" style={{ background: BOX_GRAD }}>
          <h4 className="m-0 text-[13px] font-semibold flex items-center gap-2.5">
            <span className="w-[30px] h-[30px] rounded-xl flex items-center justify-center border border-rcn-brand/25 bg-white/70 shadow">🕒</span>
            Communication & Activity Log
          </h4>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-black border border-rcn-brand/25 bg-white/70 text-rcn-accent-dark">Audit Trail</span>
        </div>
        {overlayComms.length > 0 ? (
          <div className="overflow-hidden rounded-[14px] border border-slate-200 bg-white">
            <table className="w-full border-collapse text-xs">
              <thead><tr><th className="text-left p-2.5 bg-rcn-brand/10 font-black text-[11px] uppercase">Time</th><th className="text-left p-2.5 bg-rcn-brand/10 font-black text-[11px] uppercase">Who</th><th className="text-left p-2.5 bg-rcn-brand/10 font-black text-[11px] uppercase">Message</th></tr></thead>
              <tbody>
                {[...overlayComms].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).map((c, i) => (
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
  );
}
