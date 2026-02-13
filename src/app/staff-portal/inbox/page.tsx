"use client";

import React, { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getOrganizationReferralSentApi } from "@/apis/ApiCalls";
import { checkResponse } from "@/utils/commonFunc";
import defaultQueryKeys from "@/utils/staffQueryKeys";
import type { Company, Referral, SentReferralApi } from "./types";
import { DEMO_COMPANIES } from "./demo-data";
import { SenderInbox, ReceiverInbox } from "@/components/staffComponents";

export default function StaffInboxPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [forwardPatches, setForwardPatches] = useState<Map<string, SentReferralApi>>(new Map());
  const [companyDirectory, setCompanyDirectory] = useState<Company[]>(() => [...DEMO_COMPANIES]);
  const [role, setRole] = useState<"SENDER" | "RECEIVER">("SENDER");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilterDays, setDateFilterDays] = useState(30);
  const [query, setQuery] = useState("");

  const { data: sentReferrals, isLoading: isLoadingSent } = useQuery({
    queryKey: defaultQueryKeys.referralSentList,
    queryFn: async () => {
      const res = await getOrganizationReferralSentApi();
      if (!checkResponse({ res })) return [];
      const data = (res.data as { data?: SentReferralApi[] })?.data;
      return Array.isArray(data) ? data : [];
    },
  });

  const baseReferrals = useMemo(() => sentReferrals ?? [], [sentReferrals]);
  const senderReferrals = useMemo(
    () => baseReferrals.map((r) => forwardPatches.get(r._id) ?? r),
    [baseReferrals, forwardPatches]
  );

  const setSenderReferrals = useCallback(
    (arg: React.SetStateAction<SentReferralApi[]>) => {
      if (typeof arg === "function") {
        setForwardPatches((prev) => {
          const currentList = baseReferrals.map((r) => prev.get(r._id) ?? r);
          const updatedList = (arg as (prev: SentReferralApi[]) => SentReferralApi[])(currentList);
          const next = new Map(prev);
          updatedList.forEach((r) => next.set(r._id, r));
          return next;
        });
      }
    },
    [baseReferrals]
  );

  return (
    <div className="max-w-[1280px] mx-auto p-[18px]">
      {/* Topbar */}
      <div className="flex flex-wrap gap-3 items-center justify-between p-3.5 px-4 border border-slate-200 bg-white/80 backdrop-blur-md rounded-2xl shadow-[0_10px_30px_rgba(2,6,23,.07)] sticky top-2.5 z-10">
        <div className="flex items-center gap-2.5 min-w-[260px]">
          <div className="w-[34px] h-[34px] rounded-xl bg-linear-to-br from-rcn-brand-light to-rcn-brand shadow-[0_10px_22px_rgba(15,107,58,.22)]" aria-hidden />
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
            className={`border-0 bg-transparent px-3 py-2 rounded-full cursor-pointer font-extrabold text-xs ${role === "SENDER" ? "bg-rcn-brand/10 text-rcn-text border border-rcn-brand/20" : "text-rcn-muted"}`}
          >
            Sender Inbox
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={role === "RECEIVER"}
            onClick={() => setRole("RECEIVER")}
            className={`border-0 bg-transparent px-3 py-2 rounded-full cursor-pointer font-extrabold text-xs ${role === "RECEIVER" ? "bg-rcn-brand/10 text-rcn-text border border-rcn-brand/20" : "text-rcn-muted"}`}
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
          referrals={senderReferrals}
          setReferrals={setSenderReferrals}
          companyDirectory={companyDirectory}
          setCompanyDirectory={setCompanyDirectory}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          dateFilterDays={dateFilterDays}
          setDateFilterDays={setDateFilterDays}
          query={query}
          setQuery={setQuery}
          isLoading={isLoadingSent}
        />
      ) : (
        <ReceiverInbox
          referrals={referrals}
          setReferrals={setReferrals}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          dateFilterDays={dateFilterDays}
          setDateFilterDays={setDateFilterDays}
          query={query}
          setQuery={setQuery}
        />
      )}
    </div>
  );
}
