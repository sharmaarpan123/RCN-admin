"use client";

import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { checkResponse } from "@/utils/commonFunc";
import defaultQueryKeys from "@/utils/adminQueryKeys";
import { getAdminOrganizationsApi } from "@/apis/ApiCalls";
import { StatsCards } from "@/components/MasterAdmin/dashboard/StatsCards";
import { SenderSection } from "@/components/MasterAdmin/dashboard/SenderSection";
import { ReceiverSection } from "@/components/MasterAdmin/dashboard/ReceiverSection";
import { ReferralViewModal } from "@/components/MasterAdmin/dashboard/Modals/ReferralViewModal";
import type { AdminOrganizationListItem } from "@/components/MasterAdmin/Organizations/types";

/** Map admin org list item to dashboard org shape (id, name, address). */
function mapOrgToDashboard(o: AdminOrganizationListItem) {
  const org = o.organization;
  return {
    id: o.organization_id ?? o._id ?? "",
    name: org?.name ?? "",
    address: { state: org?.state ?? "", zip: org?.zip_code ?? "" },
  };
}

const Dashboard: React.FC = () => {
  const [viewReferral, setViewReferral] = useState<Record<string, unknown> | null>(null);
  const [viewReferralIsReceiver, setViewReferralIsReceiver] = useState(false);

  // GET /api/admin/organization — org list for modal sender/receiver names
  const { data: orgsRes } = useQuery({
    queryKey: [...defaultQueryKeys.organizationsList, "dashboard"],
    queryFn: async () => {
      const res = await getAdminOrganizationsApi({ limit: 500 });
      if (!checkResponse({ res })) return { data: [] };
      return res.data as { data?: AdminOrganizationListItem[] };
    },
  });

  const orgs = useMemo(() => {
    const list = orgsRes?.data ?? [];
    return list.map(mapOrgToDashboard).filter((o) => o.id);
  }, [orgsRes?.data]);

  const handleViewReferral = (ref: Record<string, unknown>, isReceiver: boolean) => {
    setViewReferral(ref);
    setViewReferralIsReceiver(isReceiver);
  };

  return (
    <>
      <StatsCards />

      <div className="h-px bg-rcn-border my-3.5"></div>
      <div className="banner-gradient border my-2 border-rcn-accent/20 rounded-2xl p-3 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <strong className="text-rcn-dark-bg">Admin: Portal Selector</strong>
          <div className="text-xs text-rcn-muted mt-1">
            Select Sender and/or Receiver organizations
          </div>
        </div>

      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 items-start">
        <SenderSection
         
          onViewReferral={(ref) => handleViewReferral(ref, false)}
        />
        <ReceiverSection
          orgs={orgs}
          onViewReferral={(ref) => handleViewReferral(ref, true)}
        />
      </div>

      <ReferralViewModal
        isOpen={viewReferral !== null}
        onClose={() => setViewReferral(null)}
        refData={viewReferral}
        orgs={orgs}
        isReceiver={viewReferralIsReceiver}
      />
    </>
  );
};

export default Dashboard;
