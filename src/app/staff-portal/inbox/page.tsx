"use client";

import { getOrganizationReferralReceivedApi, getOrganizationReferralSentApi } from "@/apis/ApiCalls";
import { checkResponse } from "@/utils/commonFunc";
import defaultQueryKeys from "@/utils/staffQueryKeys";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { ReceivedReferralApi, ReferralListMeta, ReferralListResponse, SentReferralApi } from "./types";

const defaultMeta: ReferralListMeta = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false,
};

import { ReceiverInbox, SenderInbox } from "@/components/staffComponents";

export type SenderInboxType = "all" | "draft" | "sent";
export type ReceiverInboxType = "all" | "pending" | "accepted" | "rejected" | "paid";

export type SenderInboxBody = { page: number; limit: number; search: string, type: SenderInboxType, day: number };
export type ReceiverInboxBody = { page: number; limit: number; search: string, type: ReceiverInboxType, day: number };

export default function StaffInboxPage() {
  const [role, setRole] = useState<"SENDER" | "RECEIVER">("SENDER");

  const [senderBody, setSenderBody] = useState<SenderInboxBody>({ page: 1, limit: 10, search: "", type: "all", day: 30 });
  const [receiverBody, setReceiverBody] = useState<ReceiverInboxBody>({ page: 1, limit: 10, search: "", type: "all", day: 30 });

  const { data: sentResponse, isLoading: isLoadingSent } = useQuery({
    queryKey: [...defaultQueryKeys.referralSentList, senderBody.page, senderBody.search, senderBody.type, senderBody.day],
    queryFn: async (): Promise<ReferralListResponse<SentReferralApi>> => {
      const res = await getOrganizationReferralSentApi({
        page: senderBody.page,
        limit: senderBody.limit,
        search: senderBody.search || undefined,
        type: senderBody.type as SenderInboxType,
        days: senderBody.day,
      });
      if (!checkResponse({ res })) return { data: [], meta: defaultMeta };
      const raw = res.data as { data?: SentReferralApi[]; meta?: ReferralListMeta };
      const data = Array.isArray(raw?.data) ? raw.data : [];
      const meta = raw?.meta ?? { ...defaultMeta, total: data.length, totalPages: Math.ceil((data.length || 1) / (senderBody.limit || 10)) };
      return { data, meta };
    },
  });

  const { data: receivedResponse, isLoading: isLoadingReceived } = useQuery({
    queryKey: [...defaultQueryKeys.referralReceivedList, receiverBody.page, receiverBody.limit, receiverBody.search, receiverBody.type, receiverBody.day],
    queryFn: async (): Promise<ReferralListResponse<ReceivedReferralApi>> => {
      const res = await getOrganizationReferralReceivedApi({
        page: receiverBody.page,
        limit: receiverBody.limit,
        search: receiverBody.search || undefined,
        type: "all",
        status: receiverBody.type as ReceiverInboxType,
        days: receiverBody.day,
      });
      if (!checkResponse({ res })) return { data: [], meta: defaultMeta };
      const raw = res.data as { data?: ReceivedReferralApi[]; meta?: ReferralListMeta };
      const data = Array.isArray(raw?.data) ? raw.data : [];
      const meta = raw?.meta ?? { ...defaultMeta, total: data.length, totalPages: Math.ceil((data.length || 1) / (receiverBody.limit || 10)) };
      return { data, meta };
    },
  });

  const baseReferrals = useMemo(() => sentResponse?.data ?? [], [sentResponse]);

  const sentMeta = sentResponse?.meta ?? defaultMeta;
  const receivedMeta = receivedResponse?.meta ?? defaultMeta;
  const baseReceivedReferrals = useMemo(() => receivedResponse?.data ?? [], [receivedResponse]);



  return (
    <div className="max-w-[1280px] mx-auto p-[18px]">
      {/* Topbar */}
      <div className="flex flex-wrap gap-3 items-center justify-between p-3.5 px-4 border border-slate-200 bg-white/80 backdrop-blur-md rounded-2xl shadow-[0_10px_30px_rgba(2,6,23,.07)] sticky top-2.5 z-10">
        <div className="flex items-center gap-2.5 min-w-[260px]">
          <div>
            <h1 className="m-0 text-[15px] font-semibold leading-tight tracking-wide">Referral Coordination Network</h1>
            <p className="m-0 text-xs text-rcn-muted font-bold">Website Inbox • Sender + Receiver</p>
          </div>
        </div>

        <div className="flex bg-white border border-slate-200 rounded-full p-1 gap-1 shadow-[0_8px_20px_rgba(2,6,23,.06)]" role="tablist" aria-label="Select view">
          <button
            type="button"
            role="tab"
            aria-selected={role === "SENDER"}
            onClick={() => setRole("SENDER")}
            className={`border-0 bg-transparent px-3
               py-2 rounded-full cursor-pointer font-semibold text-sm
               ${role === "SENDER" ? "bg-rcn-brand/10 text-rcn-text border border-rcn-brand/20" : "text-rcn-muted"}
               `}
          >
            Sender Inbox
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={role === "RECEIVER"}
            onClick={() => setRole("RECEIVER")}
            className={`border-0 bg-transparent px-3 py-2 rounded-full cursor-pointer font-semibold text-xs
               ${role === "RECEIVER" ?
                "bg-rcn-brand/10 text-rcn-text border border-rcn-brand/20" :
                "text-rcn-muted"}`}
          >
            Receiver Inbox
          </button>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap justify-end">
          <Link href="/staff-portal/new-referral" className="border border-rcn-brand/25 bg-rcn-brand/10 text-rcn-accent-dark px-3 py-2.5 rounded-xl font-extrabold text-xs shadow-[0_10px_22px_rgba(2,6,23,.06)] whitespace-nowrap no-underline">
            + New Referral
          </Link>

        </div>
      </div>

      {role === "SENDER" ? (
        <SenderInbox
          body={senderBody}
          setBody={setSenderBody}
          referrals={baseReferrals}
          meta={sentMeta}
          isLoading={isLoadingSent}
        />
      ) : (
        <ReceiverInbox
          referrals={baseReceivedReferrals}
          body={receiverBody}
          setBody={setReceiverBody}
          meta={receivedMeta}
          isLoading={isLoadingReceived}
        />
      )}
    </div>
  );
}
