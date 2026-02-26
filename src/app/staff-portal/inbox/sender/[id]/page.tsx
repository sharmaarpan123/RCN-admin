"use client";

import { getOrganizationReferralByIdApi } from "@/apis/ApiCalls";
import { scrollToId } from "@/app/staff-portal/inbox/helpers";
import type { ChatMsg, Comm, ReceiverInstance, ReferralByIdApi } from "@/app/staff-portal/inbox/types";
import { Button } from "@/components";
import { SenderDetailSections } from "@/components/staffComponents/inbox/sender/view/SenderDetailSections";
import { SenderDraftPaymentSection } from "@/components/staffComponents/inbox/sender/view/SenderDraftPaymentSection";
import type { DocRow } from "@/components/staffComponents/inbox/sender/view/senderViewHelpers";
import { documentsToList, receiversFromData } from "@/components/staffComponents/inbox/sender/view/senderViewHelpers";
import { checkResponse, downloadUrl, printPdf } from "@/utils/commonFunc";
import defaultQueryKeys from "@/utils/staffQueryKeys";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import PrintIcon from "@/assets/svg/PrintIcon.jsx";

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

  const [chatReceiverSelection, setChatReceiverSelection] = useState<Record<string, string>>({});
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
    ...visibleApiDocs.map((d) => ({ label: d.label, url: d.url, kind: "api" as const })),
    ...overlay.extraDocs.map((d, i) => ({ label: d.label, url: d.url, type: d.type, kind: "local" as const, localIndex: i })),
  ];









  const isDraft = data.is_draft === true;

  const primaryCare = data.primary_care as Record<string, unknown> | undefined;
  const hasPrimaryCare = Boolean(
    primaryCare?.name || primaryCare?.address || primaryCare?.phone_number || primaryCare?.email || primaryCare?.fax || primaryCare?.npi
  );

  const navBtns = [
    { id: "secSenderInfo", label: "Sender Info" },
    { id: "secBasic", label: "Basic Info" },
    { id: "secReceivers", label: "Receivers & Status" },
    { id: "secDocs", label: "Documents" },
    { id: "secAdditional", label: "Additional Info" },
    ...(hasPrimaryCare ? [{ id: "secPrimaryCare", label: "Primary Care" }] : []),
    { id: "secChat", label: "Chat" },
    { id: "secLog", label: "Activity Log" },
    ...(isDraft ? [{ id: "secPayment", label: "Payment & Send" }] : []),
  ];


  const printPdfHandler = async (data: ReferralByIdApi) => {
    printPdf(data?.pdf_export_url ?? "");
  };



  return (
    <div className="max-w-[1280px] mx-auto p-[18px]">
      <div className="flex flex-wrap gap-3 items-center justify-between p-3.5 px-4 border border-slate-200 bg-white/80 backdrop-blur-md rounded-2xl shadow-[0_10px_30px_rgba(2,6,23,.07)] sticky top-2.5 z-10 mb-3.5">
        <div className="flex items-center gap-2.5">
          <Link href="/staff-portal/inbox" className="text-rcn-brand hover:underline text-sm font-semibold">← Back to Inbox</Link>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap justify-end">
        </div>
      </div>

      <div className="border border-slate-200 bg-white/65 rounded-2xl shadow-[0_10px_30px_rgba(2,6,23,.07)] overflow-hidden">
        <div className="p-3.5 pt-3 pb-2.5  flex items-center justify-between">
          <div className="border-b border-slate-200 bg-white/90">
            <h2 className="m-0 text-sm font-semibold tracking-wide">Referral Detail</h2>
            <p className="m-0 mt-1 text-rcn-muted text-xs font-[650]">Sender view: all receivers + per-receiver chat. Messaging at any status.</p>
          </div>

          <Button variant="primary" size="sm" onClick={() => printPdfHandler(data)}>
            <PrintIcon size={24} />
          </Button>

        </div>
        <div className="p-3 overflow-auto">
          <div className="flex flex-col gap-3.5">
            <SenderDetailSections
              data={data}
              allReceivers={allReceivers}
              displayDocRows={displayDocRows}
            />
            {isDraft && <SenderDraftPaymentSection refId={refId} />}
          </div>
        </div>
      </div>


    </div>
  );
}
