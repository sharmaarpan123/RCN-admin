"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getOrganizationReferralByIdApi } from "@/apis/ApiCalls";
import { checkResponse } from "@/utils/commonFunc";
import defaultQueryKeys from "@/utils/staffQueryKeys";
import type { ReferralByIdApi, Company, ReceiverInstance, ChatMsg, Comm } from "@/app/staff-portal/inbox/types";
import { fmtDate, scrollToId } from "@/app/staff-portal/inbox/helpers";
import { DEMO_COMPANIES } from "@/app/staff-portal/inbox/demo-data";
import { documentsToList, receiversFromData } from "@/components/staffComponents/inbox/sender/view/senderViewHelpers";
import type { DocRow } from "@/components/staffComponents/inbox/sender/view/senderViewHelpers";
import { SenderDetailModals } from "@/components/staffComponents/inbox/sender/view/SenderDetailModals";
import { SenderDetailSections } from "@/components/staffComponents/inbox/sender/view/SenderDetailSections";
import { SenderDraftPaymentSection } from "@/components/staffComponents/inbox/sender/view/SenderDraftPaymentSection";

export default function SenderDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string | undefined;

  const { data: apiData, isLoading } = useQuery({
    queryKey: [...defaultQueryKeys.referralSentList, "detail", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await getOrganizationReferralByIdApi(id);
      if (!checkResponse({ res })) return null;
      const data = (res.data as { data?: ReferralByIdApi })?.data;
      return data ?? null;
    },
    enabled: !!id,
  });

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
    <SenderDetailContent key={id} data={apiData} />
  );
}

interface LocalOverlay {
  receivers: ReceiverInstance[];
  chatByReceiver: Record<string, ChatMsg[]>;
  comms: Comm[];
  extraDocs: { label: string; type: string; url: string }[];
  deletedDocLabels: Set<string>;
}

function SenderDetailContent({ data }: { data: ReferralByIdApi }) {
  const [companyDirectory, setCompanyDirectory] = useState<Company[]>(() => [...DEMO_COMPANIES]);
  const [forwardOpen, setForwardOpen] = useState(false);
  const [forwardRefId, setForwardRefId] = useState<string | null>(null);
  const [forwardSelectedCompany, setForwardSelectedCompany] = useState<Company | null>(null);
  const [chatReceiverSelection, setChatReceiverSelection] = useState<Record<string, string>>({});
  const [deleteDocModal, setDeleteDocModal] = useState<{ kind: "api" | "local"; label: string; index: number } | null>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  const [overlay, setOverlay] = useState<LocalOverlay>(() => ({
    receivers: [],
    chatByReceiver: {},
    comms: [],
    extraDocs: [],
    deletedDocLabels: new Set(),
  }));

  const apiReceivers = receiversFromData(data);
  const allReceivers = [...apiReceivers, ...overlay.receivers];
  const refId = data._id;
  const chatReceiverId = chatReceiverSelection[refId] ?? allReceivers[0]?.receiverId ?? null;
  const thread = chatReceiverId ? (overlay.chatByReceiver[chatReceiverId] ?? []) : [];

  useEffect(() => {
    if (chatBodyRef.current) chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
  }, [thread.length, refId]);

  const apiDocsList = documentsToList(data.documents as Record<string, unknown> | undefined);
  const visibleApiDocs = apiDocsList.filter((d) => !overlay.deletedDocLabels.has(d.label));
  const displayDocRows: DocRow[] = [
    ...visibleApiDocs.map((d) => ({ label: d.label, url: d.url, type: "Clinical", kind: "api" as const })),
    ...overlay.extraDocs.map((d, i) => ({ label: d.label, url: d.url, type: d.type, kind: "local" as const, localIndex: i })),
  ];

  const addDoc = useCallback((_refId: string, name: string, type: string, fileName: string) => {
    const nm = (name || "").trim();
    if (!nm) return alert("Document name required.");
    setOverlay((prev) => ({
      ...prev,
      extraDocs: [...prev.extraDocs, { label: nm, type: type || "Other", url: fileName || "" }],
      comms: [...prev.comms, { at: new Date(), who: "Sender", msg: `Uploaded document: ${nm} (${type || "Other"}).` }],
    }));
  }, []);

  const openDeleteDocModal = useCallback((kind: "api" | "local", label: string, index: number) => {
    setDeleteDocModal({ kind, label, index });
  }, []);

  const confirmDeleteDoc = useCallback(() => {
    if (!deleteDocModal) return;
    const { kind, label, index } = deleteDocModal;
    setOverlay((prev) => {
      if (kind === "api") return { ...prev, deletedDocLabels: new Set(prev.deletedDocLabels).add(label), comms: [...prev.comms, { at: new Date(), who: "Sender", msg: `Deleted document: ${label}.` }] };
      return { ...prev, extraDocs: prev.extraDocs.filter((_, i) => i !== index), comms: [...prev.comms, { at: new Date(), who: "Sender", msg: `Deleted document: ${label}.` }] };
    });
    setDeleteDocModal(null);
  }, [deleteDocModal]);

  const sendChatMessage = useCallback((receiverId: string, text: string) => {
    const msg = (text || "").trim();
    if (!msg) return;
    setOverlay((prev) => {
      const chat = { ...prev.chatByReceiver };
      const t = chat[receiverId] ?? [];
      chat[receiverId] = [...t, { at: new Date(), fromRole: "SENDER", fromName: "Sender", text: msg }];
      return { ...prev, chatByReceiver: chat, comms: [...prev.comms, { at: new Date(), who: "Sender", msg: "Chat message sent to receiver." }] };
    });
  }, []);

  const openForward = useCallback(() => {
    setForwardRefId(refId);
    setForwardSelectedCompany(null);
    setForwardOpen(true);
  }, [refId]);

  const forwardReferral = useCallback((company: Company, customServices: string[] | null) => {
    const rxId = "RX-FWD-" + Math.random().toString(16).slice(2, 8).toUpperCase();
    const rec: ReceiverInstance = { receiverId: rxId, name: company.name.trim(), email: (company.email || "").trim(), status: "PENDING", paidUnlocked: false, updatedAt: new Date(), rejectReason: "", servicesRequestedOverride: customServices ?? null };
    setOverlay((prev) => ({
      ...prev,
      receivers: [...prev.receivers, rec],
      chatByReceiver: { ...prev.chatByReceiver, [rxId]: [] },
      comms: [...prev.comms, { at: new Date(), who: "Sender", msg: `Forwarded referral to ${company.name.trim()}${company.email ? " (" + company.email.trim() + ")" : ""}${customServices?.length ? " • Services: " + customServices.join(", ") : ""}.` }],
    }));
    setChatReceiverSelection((s) => ({ ...s, [refId]: rxId }));
    setForwardOpen(false);
    setTimeout(() => scrollToId("secReceivers"), 0);
  }, [refId]);

  const addCompanyAndSelect = useCallback(
    (name: string, email: string) => {
      const n = name.trim();
      if (!n) return;
      if (!companyDirectory.some((c) => c.name.toLowerCase() === n.toLowerCase())) setCompanyDirectory((prev) => [{ name: n, email: email.trim() }, ...prev]);
      setForwardSelectedCompany({ name: n, email: email.trim() });
    },
    [companyDirectory]
  );

  const isDraft = data.is_draft === true;

  const navBtns = [
    { id: "secBasic", label: "Basic Info" },
    { id: "secReceivers", label: "Receivers & Status" },
    { id: "secDocs", label: "Documents" },
    { id: "secAdditional", label: "Additional Info" },
    { id: "secChat", label: "Chat" },
    { id: "secLog", label: "Activity Log" },
    ...(isDraft ? [{ id: "secPayment", label: "Payment & Send" }] : []),
  ];

  const sentAt = data.sent_at ? new Date(data.sent_at) : new Date(data.createdAt ?? 0);
  const p = data.patient ?? {};
  const chatInputSelected = { receivers: allReceivers };

  return (
    <div className="max-w-[1280px] mx-auto p-[18px]">
      <div className="flex flex-wrap gap-3 items-center justify-between p-3.5 px-4 border border-slate-200 bg-white/80 backdrop-blur-md rounded-2xl shadow-[0_10px_30px_rgba(2,6,23,.07)] sticky top-2.5 z-10 mb-3.5">
        <div className="flex items-center gap-2.5">
          <Link href="/staff-portal/inbox" className="text-rcn-brand hover:underline text-sm font-semibold">← Back to Inbox</Link>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap justify-end">
          <button type="button" onClick={() => window.print()} className="border border-slate-200 bg-white px-2.5 py-2 rounded-xl font-extrabold text-xs shadow">Export/Print Summary</button>
          <button type="button" onClick={openForward} className="border border-rcn-brand/30 bg-rcn-brand/10 text-rcn-accent-dark px-2.5 py-2 rounded-xl font-extrabold text-xs shadow">Forward Referral</button>
        </div>
      </div>

      <div className="border border-slate-200 bg-white/65 rounded-2xl shadow-[0_10px_30px_rgba(2,6,23,.07)] overflow-hidden">
        <div className="p-3.5 pt-3 pb-2.5 border-b border-slate-200 bg-white/90">
          <h2 className="m-0 text-sm font-semibold tracking-wide">Referral Detail</h2>
          <p className="m-0 mt-1 text-rcn-muted text-xs font-[850]">Sender view: all receivers + per-receiver chat. Messaging at any status.</p>
        </div>
        <div className="p-3 overflow-auto">
          <div className="flex flex-wrap gap-3 items-start justify-between p-3.5 rounded-2xl border border-rcn-brand/20 bg-white/95 shadow-[0_12px_26px_rgba(2,6,23,.07)] mb-3">
            <div>
              <h3 className="m-0 text-[15px] font-semibold tracking-wide"> {p.patient_last_name ?? ""}, {p.patient_first_name ?? ""} • DOB {p.dob ?? ""} • {p.gender ?? ""}</h3>
              <p className="m-0 mt-1.5 text-rcn-muted text-xs font-[850]">Sent: {fmtDate(sentAt)} • Address of Care: {p.address_of_care ?? ""}</p>
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
            <SenderDetailSections
              data={data}
              overlayComms={overlay.comms}
              refId={refId}
              allReceivers={allReceivers}
              chatReceiverId={chatReceiverId}
              thread={thread}
              chatBodyRef={chatBodyRef}
              displayDocRows={displayDocRows}
              setChatReceiverSelection={setChatReceiverSelection}
              openDeleteDocModal={openDeleteDocModal}
              addDoc={addDoc}
              sendChatMessage={sendChatMessage}
              chatInputSelected={chatInputSelected}
            />
            {isDraft && <SenderDraftPaymentSection refId={refId} />}
          </div>
        </div>
      </div>

      <SenderDetailModals
        forwardOpen={forwardOpen}
        onCloseForward={() => { setForwardOpen(false); setForwardRefId(null); setForwardSelectedCompany(null); }}
        forwardRefId={forwardRefId}
        servicesRequested={data.speciality_ids ?? []}
        companyDirectory={companyDirectory}
        selectedCompany={forwardSelectedCompany}
        onSelectCompany={setForwardSelectedCompany}
        onForward={(company, customServices) => forwardRefId != null && forwardReferral(company, customServices)}
        onAddCompanyAndSelect={addCompanyAndSelect}
        deleteDocModal={deleteDocModal}
        onCloseDeleteDoc={() => setDeleteDocModal(null)}
        onConfirmDeleteDoc={confirmDeleteDoc}
      />
    </div>
  );
}
