"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getOrganizationReferralByIdApi } from "@/apis/ApiCalls";
import { checkResponse } from "@/utils/commonFunc";
import defaultQueryKeys from "@/utils/staffQueryKeys";
import type { ReferralByIdApi, ReceiverInstance, ChatMsg, Comm } from "@/app/staff-portal/inbox/types";
import { fmtDate, pillClass, scrollToId } from "@/app/staff-portal/inbox/helpers";
import { documentsToList, receiversFromData } from "@/components/staffComponents/inbox/sender/view/senderViewHelpers";
import { BOX_GRAD } from "@/components/staffComponents/inbox/sender/view/senderViewHelpers";
import { ChatInput } from "@/components/staffComponents/inbox/sender/view/ChatInput";

interface ReceiverOverlay {
  chatByReceiver: Record<string, ChatMsg[]>;
  comms: Comm[];
  /** Local status override for demo until accept/reject/pay APIs exist */
  receiverStatusOverride: Record<string, string>;
  paidUnlockedOverride: Record<string, boolean>;
  rejectReasonOverride: Record<string, string>;
}

export default function ReceiverDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string | undefined;

  const { data: apiData, isLoading } = useQuery({
    queryKey: [...defaultQueryKeys.referralReceivedList, "detail", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await getOrganizationReferralByIdApi(id);
      if (!checkResponse({ res })) return null;
      const data = (res.data as { data?: ReferralByIdApi })?.data;
      return data ?? null;
    },
    enabled: !!id,
  });

  const chatBodyRef = useRef<HTMLDivElement>(null);

  const [overlay, setOverlay] = useState<ReceiverOverlay>(() => ({
    chatByReceiver: {},
    comms: [],
    receiverStatusOverride: {},
    paidUnlockedOverride: {},
    rejectReasonOverride: {},
  }));

  if (isLoading) {
    return (
      <div className="max-w-[1280px] mx-auto p-[18px]">
        <div className="py-10 text-center text-rcn-muted">Loading referral…</div>
      </div>
    );
  }

  if (!apiData) {
    return (
      <div className="max-w-[1280px] mx-auto p-[18px]">
        <div className="py-10 text-center">
          <h2 className="text-lg font-semibold mb-2">Referral not found</h2>
          <Link href="/staff-portal/inbox" className="text-rcn-brand hover:underline">Back to Inbox</Link>
        </div>
      </div>
    );
  }

  return (
    <ReceiverDetailContent key={id} data={apiData} overlay={overlay} setOverlay={setOverlay} chatBodyRef={chatBodyRef} />
  );
}

function ReceiverDetailContent({
  data,
  overlay,
  setOverlay,
  chatBodyRef,
}: {
  data: ReferralByIdApi;
  overlay: ReceiverOverlay;
  setOverlay: React.Dispatch<React.SetStateAction<ReceiverOverlay>>;
  chatBodyRef: React.RefObject<HTMLDivElement | null>;
}) {
  const refId = data._id;
  const apiReceivers = receiversFromData(data);
  const currentReceiver: ReceiverInstance | null = apiReceivers[0] ?? null;
  const receiverId = currentReceiver?.receiverId ?? null;

  const statusOverride = receiverId ? overlay.receiverStatusOverride[receiverId] : undefined;
  const paidOverride = receiverId ? overlay.paidUnlockedOverride[receiverId] : undefined;
  const rejectReasonDisplay = receiverId ? (overlay.rejectReasonOverride[receiverId] ?? currentReceiver?.rejectReason) : "";

  const receiverStatus = statusOverride ?? currentReceiver?.status ?? "PENDING";
  const paidUnlocked = paidOverride ?? currentReceiver?.paidUnlocked ?? false;
  const isUnlocked = paidUnlocked || receiverStatus === "PAID" || receiverStatus === "COMPLETED";

  const thread = receiverId ? (overlay.chatByReceiver[receiverId] ?? []) : [];
  const comms = overlay.comms;

  useEffect(() => {
    if (chatBodyRef.current) chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
  }, [thread.length, refId, chatBodyRef]);

  const receiverSetStatus = useCallback(
    (status: string) => {
      if (!receiverId) return;
      setOverlay((prev) => ({
        ...prev,
        receiverStatusOverride: { ...prev.receiverStatusOverride, [receiverId]: status },
        comms: [...prev.comms, { at: new Date(), who: currentReceiver?.name ?? "Receiver", msg: `Status changed: ${status}` }],
      }));
    },
    [receiverId, currentReceiver?.name, setOverlay]
  );

  const receiverReject = useCallback(() => {
    const reason = prompt("Rejection reason (optional):", "Not a fit / Out of service area") ?? "";
    if (!receiverId) return;
    setOverlay((prev) => ({
      ...prev,
      receiverStatusOverride: { ...prev.receiverStatusOverride, [receiverId]: "REJECTED" },
      rejectReasonOverride: { ...prev.rejectReasonOverride, [receiverId]: reason.trim() },
      comms: [...prev.comms, { at: new Date(), who: currentReceiver?.name ?? "Receiver", msg: `Rejected${reason.trim() ? ": " + reason.trim() : ""}.` }],
    }));
  }, [receiverId, currentReceiver?.name, setOverlay]);

  const receiverPayUnlock = useCallback(() => {
    if (!confirm("Pay service fee to unlock additional patient info?")) return;
    if (!receiverId) return;
    setOverlay((prev) => ({
      ...prev,
      receiverStatusOverride: { ...prev.receiverStatusOverride, [receiverId]: "PAID" },
      paidUnlockedOverride: { ...prev.paidUnlockedOverride, [receiverId]: true },
      comms: [...prev.comms, { at: new Date(), who: "System", msg: "Receiver paid and unlocked additional info." }],
    }));
  }, [receiverId, setOverlay]);

  const sendChatMessage = useCallback(
    (_receiverId: string, text: string) => {
      const msg = (text || "").trim();
      if (!msg || !receiverId) return;
      setOverlay((prev) => {
        const chat = { ...prev.chatByReceiver };
        const t = chat[receiverId] ?? [];
        chat[receiverId] = [...t, { at: new Date(), fromRole: "RECEIVER", fromName: currentReceiver?.name ?? "Receiver", text: msg }];
        return {
          ...prev,
          chatByReceiver: chat,
          comms: [...prev.comms, { at: new Date(), who: currentReceiver?.name ?? "Receiver", msg: "Chat message sent to sender." }],
        };
      });
    },
    [receiverId, currentReceiver?.name, setOverlay]
  );

  const p = data.patient ?? {};
  const ins = data.patient_insurance_information ?? [];
  const primary = ins[0];
  const addPatient = (data.additional_patient ?? {}) as Record<string, string>;
  const sentAt = data.sent_at ? new Date(data.sent_at) : new Date(data.createdAt ?? 0);
  const servicesForDisplay =
    currentReceiver?.servicesRequestedOverride?.length ? (currentReceiver.servicesRequestedOverride ?? []) : (data.speciality_ids ?? []);

  const docList = documentsToList(data.documents as Record<string, unknown> | undefined);

  const navBtns = [
    { id: "secBasic", label: "Basic Info" },
    { id: "secDocs", label: "Documents" },
    { id: "secAdditional", label: "Additional Info" },
    { id: "secChat", label: "Chat" },
    { id: "secLog", label: "Activity Log" },
  ];

  const rxControls =
    receiverStatus === "PENDING"
      ? [
          <button key="a" type="button" onClick={() => receiverSetStatus("ACCEPTED")} className="border border-rcn-brand/30 bg-rcn-brand/10 text-rcn-accent-dark px-2.5 py-2 rounded-xl font-extrabold text-xs shadow">Accept</button>,
          <button key="r" type="button" onClick={() => receiverReject()} className="border border-red-200 bg-red-50 text-red-700 px-2.5 py-2 rounded-xl font-extrabold text-xs shadow">Reject</button>,
        ]
      : receiverStatus === "ACCEPTED"
        ? [
            <button key="p" type="button" onClick={() => receiverPayUnlock()} className="border border-rcn-brand/25 bg-rcn-brand/10 text-rcn-accent-dark px-2.5 py-2 rounded-xl font-extrabold text-xs shadow">Pay & Unlock</button>,
            <button key="r2" type="button" onClick={() => receiverReject()} className="border border-red-200 bg-red-50 text-red-700 px-2.5 py-2 rounded-xl font-extrabold text-xs shadow">Reject</button>,
          ]
        : receiverStatus === "PAID"
          ? [<span key="paid" className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-black border ${pillClass("PAID")}`}>Paid/Unlocked</span>]
          : receiverStatus === "REJECTED"
            ? [<span key="rej" className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-black border ${pillClass("REJECTED")}`}>Rejected</span>, rejectReasonDisplay ? <span key="reason" className="text-rcn-muted text-xs">Reason: {rejectReasonDisplay}</span> : null]
            : [<button key="r3" type="button" onClick={() => receiverReject()} className="border border-red-200 bg-red-50 text-red-700 px-2.5 py-2 rounded-xl font-extrabold text-xs shadow">Reject</button>];

  const chatInputSelected = { receivers: currentReceiver ? [currentReceiver] : [] };

  return (
    <div className="max-w-[1280px] mx-auto p-[18px]">
      <div className="flex flex-wrap gap-3 items-center justify-between p-3.5 px-4 border border-slate-200 bg-white/80 backdrop-blur-md rounded-2xl shadow-[0_10px_30px_rgba(2,6,23,.07)] sticky top-2.5 z-10 mb-3.5">
        <div className="flex items-center gap-2.5">
          <Link href="/staff-portal/inbox" className="text-rcn-brand hover:underline text-sm font-semibold">← Back to Inbox</Link>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">{rxControls}</div>
      </div>

      <div className="border border-slate-200 bg-white/65 rounded-2xl shadow-[0_10px_30px_rgba(2,6,23,.07)] overflow-hidden">
        <div className="p-3.5 pt-3 pb-2.5 border-b border-slate-200 bg-white/90">
          <h2 className="m-0 text-sm font-semibold tracking-wide">Referral Detail</h2>
          <p className="m-0 mt-1 text-rcn-muted text-xs font-[850]">Receiver view: chat is free. Patient information requires payment — payment flow will be added soon.</p>
        </div>
        <div className="p-3 overflow-auto">
          <div className="flex flex-wrap gap-3 items-start justify-between p-3.5 rounded-2xl border border-rcn-brand/20 bg-white/95 shadow-[0_12px_26px_rgba(2,6,23,.07)] mb-3">
            <div>
              <h3 className="m-0 text-[15px] font-semibold tracking-wide">
                {isUnlocked && p && (p.patient_last_name != null || p.patient_first_name != null)
                  ? ` ${p.patient_last_name ?? ""}, ${p.patient_first_name ?? ""} • DOB ${p.dob ?? ""} • ${p.gender ?? ""}`
                  : "  Referral (pay to view patient details)"}
              </h3>
              <p className="m-0 mt-1.5 text-rcn-muted text-xs font-[850]">Sent: {fmtDate(sentAt)}{isUnlocked && p?.address_of_care != null ? ` • Address of Care: ${p.address_of_care}` : ""}</p>
            </div>
          </div>

          <div className="border border-rcn-brand/20 rounded-2xl bg-white/95 shadow-[0_12px_26px_rgba(2,6,23,.07)] p-2.5 sticky top-[86px] z-4 mb-3" aria-label="Quick Jump Navigation">
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

          <div className="flex flex-col gap-3.5">
            {/* Basic Info — locked until payment (chat is free; patient info requires payment) */}
            <div id="secBasic" className="border  min-h-[300px] border-rcn-border/60 bg-white/95 rounded-[18px] p-3.5 shadow-[0_12px_26px_rgba(2,6,23,.07)] relative overflow-hidden border-l-4 border-l-rcn-brand">
              <div className="-m-3.5 -mt-3.5 mb-3 p-3 border-b border-rcn-border/60 rounded-t-[18px] flex items-center justify-between gap-2.5" style={{ background: BOX_GRAD }}>
                <h4 className="m-0 text-[13px] font-semibold tracking-wide flex items-center gap-2.5">
                  <span className="w-[30px] h-[30px] rounded-xl flex items-center justify-center border border-rcn-brand/25 bg-white/70 shadow">👤</span>
                  Basic Patient Information
                </h4>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-black border border-rcn-brand/25 bg-white/70 text-rcn-accent-dark">{isUnlocked ? "Visible" : "Pay to view"}</span>
              </div>
              {isUnlocked ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      ["Last Name", p.patient_last_name],
                      ["First Name", p.patient_first_name],
                      ["Date of Birth (DOB)", p.dob],
                      ["Gender", p.gender],
                      ["Address of Care", p.address_of_care],
                      ["Services Requested", servicesForDisplay.join(", ")],
                      ["Primary Insurance", primary ? `${primary.payer ?? ""} • Policy: ${primary.policy ?? ""}` : ""],
                      ["Additional Insurances", ins.length > 1 ? ins.slice(1).map((x) => `${x.payer ?? ""} • ${x.policy ?? ""}`).join(" | ") : "None"],
                    ].map(([label, val]) => (
                      <div key={String(label)}>
                        <label className="block text-[11px] text-rcn-muted font-black mb-1">{label}</label>
                        <div className="text-[13px] font-[850] text-rcn-text leading-tight p-2.5 border border-dashed border-slate-300/75 rounded-xl bg-slate-50/55">{val ?? "—"}</div>
                      </div>
                    ))}
                  </div>
                  {receiverStatus === "PENDING" && (
                    <div className="mt-3 flex gap-2.5 flex-wrap justify-end">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-black border ${pillClass("PENDING")}`}>Decision point: Accept or Reject</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 rounded-[18px] bg-slate-900/45 flex items-center justify-center p-4">
                  <div className="w-full max-w-[520px] rounded-2xl bg-white/95 border border-slate-200 shadow-[0_20px_50px_rgba(2,6,23,.25)] p-3.5">
                    <h5 className="m-0 text-[13px] font-semibold">Locked: Patient Information</h5>
                    <p className="m-0 mt-1.5 mb-3 text-rcn-muted text-xs font-[850]">Chat is free. To view patient details (name, DOB, insurance, etc.), payment is required. Payment flow will be added soon.</p>
                    <div className="flex gap-2.5 flex-wrap justify-end">
                      <button type="button" onClick={() => receiverPayUnlock()} className="border border-rcn-brand/25 bg-rcn-brand/10 text-rcn-accent-dark px-2.5 py-2 rounded-xl font-extrabold text-xs shadow">Pay & Unlock</button>
                      <button type="button" onClick={() => receiverReject()} className="border border-red-200 bg-red-50 text-red-700 px-2.5 py-2 rounded-xl font-extrabold text-xs shadow">Reject</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Documents (read-only; locked until payment) */}
            <div id="secDocs" className="border border-rcn-border/60 bg-white/95 rounded-[18px] p-3.5 shadow relative overflow-hidden border-l-4 border-l-rcn-brand scroll-mt-[120px]">
              <div className="-m-3.5 -mt-3.5 mb-3 p-3 border-b border-rcn-border/60 rounded-t-[18px] flex items-center justify-between" style={{ background: BOX_GRAD }}>
                <h4 className="m-0 text-[13px] font-semibold flex items-center gap-2.5">
                  <span className="w-[30px] h-[30px] rounded-xl flex items-center justify-center border border-rcn-brand/25 bg-white/70 shadow">📎</span>
                  Attached Documents (From Sender)
                </h4>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-black border border-rcn-brand/25 bg-white/70 text-rcn-accent-dark">{isUnlocked ? "Downloadable" : "Pay to view"}</span>
              </div>
              {isUnlocked ? (
                docList.length > 0 ? (
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
                        {docList.map((d, idx) => (
                          <tr key={idx} className="border-t border-slate-200">
                            <td className="p-2.5"><strong>{d.label}</strong>{d.url && <div className="text-rcn-muted text-xs">File: {d.url}</div>}</td>
                            <td className="p-2.5">Clinical</td>
                            <td className="p-2.5"><button type="button" onClick={() => alert(`Demo: download ${d.label}`)} className="border border-slate-200 bg-white px-2 py-1.5 rounded-xl text-xs font-extrabold shadow">Download</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-3 text-rcn-muted text-sm">No documents attached.</div>
                )
              ) : (
                <div className="rounded-[14px] border border-dashed border-rcn-brand/35 bg-rcn-brand/5 p-4 text-center">
                  <p className="m-0 text-rcn-muted text-sm font-[850]">Pay to view and download attached documents. Chat is free.</p>
                  <div className="flex gap-2.5 flex-wrap justify-center mt-3">
                    {receiverStatus === "ACCEPTED" && <button type="button" onClick={() => receiverPayUnlock()} className="border border-rcn-brand/25 bg-rcn-brand/10 text-rcn-accent-dark px-2.5 py-2 rounded-xl font-extrabold text-xs shadow">Pay & Unlock</button>}
                  </div>
                </div>
              )}
              <div className="mt-3 border border-dashed border-rcn-brand/35 rounded-[14px] bg-rcn-brand/5 p-3">
                <div className="flex justify-between gap-2.5 mb-2.5">
                  <strong className="text-xs">Upload Documents</strong>
                 
                </div>
                <div className="text-rcn-muted text-xs"> All documents are downloadable after payment.</div>
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
              {!isUnlocked && (
                <div className="absolute inset-0 rounded-[18px] bg-slate-900/45 flex items-center justify-center p-4">
                  <div className="w-full max-w-[520px] rounded-2xl bg-white/95 border border-slate-200 shadow-[0_20px_50px_rgba(2,6,23,.25)] p-3.5">
                    <h5 className="m-0 text-[13px] font-semibold">Locked: Additional Patient Information</h5>
                    <p className="m-0 mt-1.5 mb-3 text-rcn-muted text-xs font-[850]">Chat is free. To view phone, SSN, and other sensitive fields, payment is required. Payment flow will be added soon.</p>
                    <div className="flex gap-2.5 flex-wrap justify-end">
                      {receiverStatus === "ACCEPTED" && <button type="button" onClick={() => receiverPayUnlock()} className="border border-rcn-brand/25 bg-rcn-brand/10 text-rcn-accent-dark px-2.5 py-2 rounded-xl font-extrabold text-xs shadow">Pay & Unlock</button>}
                      <button type="button" onClick={() => receiverReject()} className="border border-red-200 bg-red-50 text-red-700 px-2.5 py-2 rounded-xl font-extrabold text-xs shadow">Reject</button>
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
                <ChatInput selected={chatInputSelected} chatReceiverId={receiverId} onSend={sendChatMessage} role="RECEIVER" />
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
              {comms.length > 0 ? (
                <div className="overflow-hidden rounded-[14px] border border-slate-200 bg-white">
                  <table className="w-full border-collapse text-xs">
                    <thead><tr><th className="text-left p-2.5 bg-rcn-brand/10 font-black text-[11px] uppercase">Time</th><th className="text-left p-2.5 bg-rcn-brand/10 font-black text-[11px] uppercase">Who</th><th className="text-left p-2.5 bg-rcn-brand/10 font-black text-[11px] uppercase">Message</th></tr></thead>
                    <tbody>
                      {[...comms].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).map((c, i) => (
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
        </div>
      </div>
    </div>
  );
}
