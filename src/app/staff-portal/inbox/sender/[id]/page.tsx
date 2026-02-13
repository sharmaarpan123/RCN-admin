"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getOrganizationReferralByIdApi } from "@/apis/ApiCalls";
import { checkResponse } from "@/utils/commonFunc";
import defaultQueryKeys from "@/utils/staffQueryKeys";
import type { ReferralByIdApi, Company, ReceiverInstance, ChatMsg, Comm } from "@/app/staff-portal/inbox/types";
import { fmtDate, pillClass, pillLabel, scrollToId } from "@/app/staff-portal/inbox/helpers";
import { DEMO_COMPANIES } from "@/app/staff-portal/inbox/demo-data";
import { ForwardModal } from "@/components/staffComponents/ForwardModal";
import { ChatInput } from "@/components/staffComponents/inbox/sender/view/ChatInput";
import { DocUploadInline } from "@/components/staffComponents/inbox/sender/view/DocUploadInline";
import Modal from "@/components/Modal";

const BOX_GRAD = "linear-gradient(90deg, rgba(15,107,58,.18), rgba(31,138,76,.12), rgba(31,138,76,.06))";

/** Flatten API documents object into list of { label, url } for display. Use as-is. */
function documentsToList(documents: Record<string, unknown> | undefined): { label: string; url: string }[] {
  if (!documents || typeof documents !== "object") return [];
  const out: { label: string; url: string }[] = [];
  const entries: [string, string][] = [
    ["Face Sheet", "face_sheet"],
    ["Medication List", "medication_list"],
    ["Discharge Summary", "discharge_summary"],
    ["Signed Order", "signed_order"],
    ["History & Physical", "history_or_physical"],
    ["Progress Notes", "progress_notes"],
  ];
  for (const [label, key] of entries) {
    const v = documents[key];
    if (typeof v === "string" && v) out.push({ label, url: v });
    if (Array.isArray(v) && v.length) for (let i = 0; i < v.length; i++) out.push({ label: `${label} ${i + 1}`, url: typeof v[i] === "string" ? v[i] : "" });
  }
  const wound = documents.wound_photos;
  if (Array.isArray(wound)) for (let i = 0; i < wound.length; i++) out.push({ label: `Wound Photo ${i + 1}`, url: typeof wound[i] === "string" ? wound[i] : "" });
  else if (typeof wound === "string" && wound) out.push({ label: "Wound Photo", url: wound });
  const other = documents.other_documents;
  if (Array.isArray(other)) for (let i = 0; i < other.length; i++) out.push({ label: `Other Document ${i + 1}`, url: typeof other[i] === "string" ? other[i] : "" });
  else if (typeof other === "string" && other) out.push({ label: "Other Document", url: other });
  return out;
}

/** Build receivers list from API department_statuses + _localReceivers (as-is). */
function receiversFromData(data: ReferralByIdApi): ReceiverInstance[] {
  const dept = (data.department_statuses ?? []) as { department_id?: string; status?: string; organization_name?: string; name?: string; updated_at?: string }[];
  const fromApi = dept.map((d, i) => ({
    receiverId: d.department_id ?? `dept-${i}`,
    name: d.organization_name ?? (d as { name?: string }).name ?? "Receiver",
    email: "",
    status: d.status ?? "PENDING",
    paidUnlocked: false,
    updatedAt: d.updated_at ? new Date(d.updated_at) : new Date(),
    rejectReason: "",
  }));
  return [...fromApi, ...(data._localReceivers ?? [])];
}

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
  type DocRow = { label: string; url: string; type: string; kind: "api" | "local"; localIndex?: number };
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

  const navBtns = [
    { id: "secBasic", label: "Basic Info" },
    { id: "secReceivers", label: "Receivers & Status" },
    { id: "secDocs", label: "Documents" },
    { id: "secAdditional", label: "Additional Info" },
    { id: "secChat", label: "Chat" },
    { id: "secLog", label: "Activity Log" },
  ];

  const p = data.patient ?? {};
  const ins = data.patient_insurance_information ?? [];
  const primary = ins[0];
  const addPatient = (data.additional_patient ?? {}) as Record<string, string>;
  const sentAt = data.sent_at ? new Date(data.sent_at) : new Date(data.createdAt ?? 0);

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
              <h3 className="m-0 text-[15px] font-semibold tracking-wide">{data._id} — {p.patient_last_name ?? ""}, {p.patient_first_name ?? ""} • DOB {p.dob ?? ""} • {p.gender ?? ""}</h3>
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
            {/* Basic Info — from data as-is */}
            <div id="secBasic" className="border border-rcn-border/60 bg-white/95 rounded-[18px] p-3.5 shadow-[0_12px_26px_rgba(2,6,23,.07)] relative overflow-hidden border-l-4 border-l-rcn-brand scroll-mt-[120px]">
              <div className="-m-3.5 -mt-3.5 mb-3 p-3 border-b border-rcn-border/60 rounded-t-[18px] flex items-center justify-between gap-2.5" style={{ background: BOX_GRAD }}>
                <h4 className="m-0 text-[13px] font-semibold tracking-wide flex items-center gap-2.5">
                  <span className="w-[30px] h-[30px] rounded-xl flex items-center justify-center border border-rcn-brand/25 bg-white/70 shadow">👤</span>
                  Basic Information (Always Visible)
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

            {/* Documents — from data.documents as-is + local extra */}
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
                <DocUploadInline refId={refId} onAdd={addDoc} />
              </div>
            </div>

            {/* Additional Info — from data.additional_patient as-is */}
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

            {/* Activity Log */}
            <div id="secLog" className="border border-rcn-border/60 bg-white/95 rounded-[18px] p-3.5 shadow relative overflow-hidden border-l-4 border-l-rcn-brand scroll-mt-[120px]">
              <div className="-m-3.5 -mt-3.5 mb-3 p-3 border-b border-rcn-border/60 rounded-t-[18px] flex items-center justify-between" style={{ background: BOX_GRAD }}>
                <h4 className="m-0 text-[13px] font-semibold flex items-center gap-2.5">
                  <span className="w-[30px] h-[30px] rounded-xl flex items-center justify-center border border-rcn-brand/25 bg-white/70 shadow">🕒</span>
                  Communication & Activity Log
                </h4>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-black border border-rcn-brand/25 bg-white/70 text-rcn-accent-dark">Audit Trail</span>
              </div>
              {overlay.comms.length > 0 ? (
                <div className="overflow-hidden rounded-[14px] border border-slate-200 bg-white">
                  <table className="w-full border-collapse text-xs">
                    <thead><tr><th className="text-left p-2.5 bg-rcn-brand/10 font-black text-[11px] uppercase">Time</th><th className="text-left p-2.5 bg-rcn-brand/10 font-black text-[11px] uppercase">Who</th><th className="text-left p-2.5 bg-rcn-brand/10 font-black text-[11px] uppercase">Message</th></tr></thead>
                    <tbody>
                      {[...overlay.comms].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).map((c, i) => (
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

      <ForwardModal
        isOpen={forwardOpen}
        onClose={() => { setForwardOpen(false); setForwardRefId(null); setForwardSelectedCompany(null); }}
        refId={forwardRefId}
        servicesRequested={data.speciality_ids ?? []}
        companyDirectory={companyDirectory}
        selectedCompany={forwardSelectedCompany}
        onSelectCompany={setForwardSelectedCompany}
        onForward={(company, customServices) => forwardRefId && forwardReferral(company, customServices)}
        onAddCompanyAndSelect={addCompanyAndSelect}
      />

      <Modal
        isOpen={deleteDocModal !== null}
        onClose={() => setDeleteDocModal(null)}
        maxWidth="500px"
      >
        <div className="p-4">
          <h3 className="m-0 text-base font-semibold mb-3 flex items-center gap-2.5">
            <span className="text-2xl">🗑️</span>
            Delete Document
          </h3>
          <p className="m-0 mb-4 text-sm text-rcn-text">
            Are you sure you want to delete the document <strong>&quot;{deleteDocModal?.label}&quot;</strong>? This action cannot be undone.
          </p>
          <div className="flex gap-2.5 justify-end">
            <button
              type="button"
              onClick={() => setDeleteDocModal(null)}
              className="border border-slate-200 bg-white text-rcn-text px-4 py-2 rounded-xl font-extrabold text-xs shadow hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDeleteDoc}
              className="border border-red-200 bg-red-50 text-red-700 px-4 py-2 rounded-xl font-extrabold text-xs shadow hover:bg-red-100"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
