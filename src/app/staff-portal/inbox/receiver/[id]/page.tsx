"use client";

import React, { useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getOrganizationReferralByIdApi } from "@/apis/ApiCalls";
import { checkResponse } from "@/utils/commonFunc";
import defaultQueryKeys from "@/utils/staffQueryKeys";
import type { ReferralByIdApi, ReceiverInstance, ChatMsg, Comm } from "@/app/staff-portal/inbox/types";
import { fmtDate, pillClass, scrollToId } from "@/app/staff-portal/inbox/helpers";
import { documentsToList, receiversFromData } from "@/components/staffComponents/inbox/sender/view/senderViewHelpers";
import {
  ReceiverBasicSection,
  ReceiverDocsSection,
  ReceiverAdditionalSection,
  ReceiverChatSection,
  ReceiverActivityLogSection,
} from "@/components/staffComponents/inbox/receiver/view";

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

  const localChatMessages = receiverId ? (overlay.chatByReceiver[receiverId] ?? []) : [];
  const comms = overlay.comms;

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
    if (!receiverId) return;
    setOverlay((prev) => ({
      ...prev,
      receiverStatusOverride: { ...prev.receiverStatusOverride, [receiverId]: "PAID" },
      paidUnlockedOverride: { ...prev.paidUnlockedOverride, [receiverId]: true },
      comms: [...prev.comms, { at: new Date(), who: "System", msg: "Receiver paid and unlocked additional info." }],
    }));
  }, [receiverId, setOverlay]);

  const receiverAccept = useCallback(() => {
    if (!receiverId) return;
    setOverlay((prev) => ({
      ...prev,
      receiverStatusOverride: { ...prev.receiverStatusOverride, [receiverId]: "PAID" },
      paidUnlockedOverride: { ...prev.paidUnlockedOverride, [receiverId]: true },
      comms: [...prev.comms, { at: new Date(), who: "System", msg: "Accepted (sender already paid)." }],
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

  // const isAlreadyPaidByMe = data.department_statuses?.find((status) => status.status === "PAID" && status.departmentId === receiverId);

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
            <ReceiverBasicSection
              isUnlocked={isUnlocked}
              receiverStatus={receiverStatus}
              patient={p}
              primaryInsurance={primary}
              additionalInsurances={ins}
              servicesForDisplay={servicesForDisplay}
              onPayUnlock={receiverPayUnlock}
              onReject={receiverReject}
            />
            <ReceiverDocsSection
              isUnlocked={isUnlocked}
              receiverStatus={receiverStatus}
              docList={docList}
              onPayUnlock={receiverPayUnlock}
            />
            <ReceiverAdditionalSection
              referralId={refId}
              departmentId={receiverId ?? ""}
              isUnlocked={isUnlocked}
              receiverStatus={receiverStatus}
              addPatient={addPatient}
              senderPaid={data.payment_type === "payment"}
              onAccept={receiverAccept}
              onPayUnlock={receiverPayUnlock}
              onReject={receiverReject}
            />
            <ReceiverChatSection
              referralId={refId}
              localMessages={localChatMessages}
              chatBodyRef={chatBodyRef}
              receiverId={receiverId}
              chatInputSelected={chatInputSelected}
              onSend={sendChatMessage}
            />
            <ReceiverActivityLogSection comms={comms} />
          </div>
        </div>
      </div>
    </div>
  );
}
