"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { Company } from "./types";
import { DEMO_REFERRALS, DEMO_COMPANIES } from "./demo-data";
import { SenderInbox, ReceiverInbox } from "@/components/staffComponents";

export default function StaffInboxPage() {
  const [referrals, setReferrals] = useState(() => JSON.parse(JSON.stringify(DEMO_REFERRALS)));
  const [companyDirectory, setCompanyDirectory] = useState<Company[]>(() => [...DEMO_COMPANIES]);
  const [role, setRole] = useState<"SENDER" | "RECEIVER">("SENDER");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilterDays, setDateFilterDays] = useState(30);
  const [query, setQuery] = useState("");

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
          referrals={referrals}
          setReferrals={setReferrals}
          companyDirectory={companyDirectory}
          setCompanyDirectory={setCompanyDirectory}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          dateFilterDays={dateFilterDays}
          setDateFilterDays={setDateFilterDays}
          query={query}
          setQuery={setQuery}
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
