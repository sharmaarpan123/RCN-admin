"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminReferralDashboardApi } from "@/apis/ApiCalls";
import { checkResponse } from "@/utils/commonFunc";
import defaultQueryKeys from "@/utils/adminQueryKeys";

type DashboardData = {
  total_organizations?: number;
  total_referrals?: number;
  sent_referrals?: number;
  draft_referrals?: number;
};

export function StatsCards() {
  const { data: dashboardRes, isLoading } = useQuery({
    queryKey: defaultQueryKeys.referralDashboard,
    queryFn: async () => {
      const res = await getAdminReferralDashboardApi();
      if (!checkResponse({ res })) return null;
      return res.data as { success?: boolean; data?: DashboardData };
    },
  });

  const data = dashboardRes?.data;
  const totalOrgs = (data?.total_organizations ?? 0) as number;
  const totalRefs = (data?.total_referrals ?? 0) as number;
  const sentReferrals = (data?.sent_referrals ?? 0) as number;
  const draftReferrals = (data?.draft_referrals ?? 0) as number;

  const cardClass = "bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4 flex-1 min-w-[180px]";
  const labelClass = "text-rcn-muted text-sm";
  const valueClass = "text-2xl font-extrabold mt-2";

  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-3.5">
        <div className={cardClass}>
          <div className={labelClass}>Organizations</div>
          <div className={valueClass}>—</div>
        </div>
        <div className={cardClass}>
          <div className={labelClass}>Referrals (All)</div>
          <div className={valueClass}>—</div>
        </div>
        <div className={cardClass}>
          <div className={labelClass}>Sent Referrals</div>
          <div className={valueClass}>—</div>
        </div>
        <div className={cardClass}>
          <div className={labelClass}>Draft Referrals</div>
          <div className={valueClass}>—</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3.5">
      <div className={cardClass}>
        <div className={labelClass}>Organizations</div>
        <div className={valueClass}>{totalOrgs}</div>
      </div>
      <div className={cardClass}>
        <div className={labelClass}>Referrals (All)</div>
        <div className={valueClass}>{totalRefs}</div>
      </div>
      <div className={cardClass}>
        <div className={labelClass}>Sent Referrals</div>
        <div className={valueClass}>{sentReferrals}</div>
      </div>
      <div className={cardClass}>
        <div className={labelClass}>Draft Referrals</div>
        <div className={valueClass}>{draftReferrals}</div>
      </div>
    </div>
  );
}
