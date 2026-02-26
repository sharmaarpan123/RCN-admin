"use client";

import React, { useState } from "react";
import { StatsCards } from "@/components/MasterAdmin/dashboard/StatsCards";
import { SenderSection } from "@/components/MasterAdmin/dashboard/SenderSection";
import { ReceiverSection } from "@/components/MasterAdmin/dashboard/ReceiverSection";
import { ReferralViewModal } from "@/components/MasterAdmin/dashboard/Modals/ReferralViewModal";
import { ExportColumn } from "@/components/MasterAdmin/dashboard/ExportColumn";

const Dashboard: React.FC = () => {
  const [viewReferral, setViewReferral] = useState<Record<string, unknown> | null>(null);
  const [viewReferralIsReceiver, setViewReferralIsReceiver] = useState(false);

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

      <ExportColumn />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 items-start">
        <SenderSection

          onViewReferral={(ref) => handleViewReferral(ref, false)}
        />
        <ReceiverSection
          onViewReferral={(ref) => handleViewReferral(ref, true)}
        />
      </div>

      <ReferralViewModal
        isOpen={viewReferral !== null}
        onClose={() => setViewReferral(null)}
        refData={viewReferral}

        isReceiver={viewReferralIsReceiver}
      />
    </>
  );
};

export default Dashboard;
