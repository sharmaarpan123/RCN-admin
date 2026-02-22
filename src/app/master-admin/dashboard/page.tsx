"use client";

import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components";
import { fmtDate } from "@/utils/database";
import { toastWarning } from "@/utils/toast";
import { checkResponse } from "@/utils/commonFunc";
import defaultQueryKeys from "@/utils/adminQueryKeys";
import { getAdminOrganizationsApi } from "@/apis/ApiCalls";
import { StatsCards } from "@/components/MasterAdmin/dashboard/StatsCards";
import { SenderSection } from "@/components/MasterAdmin/dashboard/SenderSection";
import { ReceiverSection } from "@/components/MasterAdmin/dashboard/ReceiverSection";
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
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  const openModal = (content: React.ReactNode) => setModalContent(content);
  const closeModal = () => setModalContent(null);

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

  const getStatusClass = (status: string) => {
    if (status === "Accepted") return "border-[#b9e2c8] bg-[#f1fbf5] text-[#0b5d36]";
    if (status === "Rejected") return "border-[#f3b8b8] bg-[#fff1f2] text-[#991b1b]";
    if (status === "Pending") return "border-[#f3d9a1] bg-[#fff8e6] text-[#7a4a00]";
    return "";
  };

  const handleViewReferral = (ref: Record<string, unknown>, isReceiver: boolean) => {
    const refId = (ref.id ?? ref._id) as string;
    const senderId = (ref.senderOrgId ?? ref.sender_organization_id ?? ref.sender_org_id) as string;
    const receiverId = (ref.receiverOrgId ?? ref.receiver_organization_id ?? ref.receiver_org_id) as string;
    const sender = orgs.find((o) => o.id === senderId);
    const receiver = orgs.find((o) => o.id === receiverId);

    const refDate = (ref.createdAt ?? ref.created_at) as string;
    const refStatus = (ref.status ?? ref.referral_status) as string;
    const patient = (ref.patient ?? ref.patient_info) as Record<string, unknown> | undefined;
    const insurance = (ref.insurance ?? ref.insurance_info) as Record<string, unknown> | undefined;
    const primary = insurance?.primary as Record<string, unknown> | undefined;
    const billing = ref.billing as Record<string, unknown> | undefined;

    openModal(
      <div>
        <h3 className="m-0 mb-3 text-lg font-semibold">Referral Details</h3>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <div className="text-xs text-rcn-muted mb-1">Referral ID</div>
            <div className="text-sm font-mono">{refId}</div>
          </div>
          <div>
            <div className="text-xs text-rcn-muted mb-1">Date</div>
            <div className="text-sm">{fmtDate(refDate)}</div>
          </div>
        </div>

        <div className="h-px bg-rcn-border my-3"></div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <div className="text-xs text-rcn-muted mb-1">Sender Organization</div>
            <div className="text-sm font-semibold">{sender?.name || "—"}</div>
            {sender && (
              <div className="text-xs text-rcn-muted">
                {sender.address?.state} {sender.address?.zip}
              </div>
            )}
          </div>
          <div>
            <div className="text-xs text-rcn-muted mb-1">Receiver Organization</div>
            <div className="text-sm font-semibold">{receiver?.name || "—"}</div>
            {receiver && (
              <div className="text-xs text-rcn-muted">
                {receiver.address?.state} {receiver.address?.zip}
              </div>
            )}
          </div>
        </div>

        <div className="h-px bg-rcn-border my-3"></div>

        <div className="mb-4">
          <div className="text-xs text-rcn-muted mb-1">Patient Information</div>
          <div className="text-sm">
            <strong>Name:</strong> {String(patient?.last ?? patient?.last_name ?? "—")}, {String(patient?.first ?? patient?.first_name ?? "—")}<br />
            <strong>DOB:</strong> {String(patient?.dob ?? "—")}<br />
            <strong>Gender:</strong> {String(patient?.gender ?? "—")}<br />
            <strong>Insurance:</strong> {String(primary?.payer ?? "—")} ({String(primary?.policy ?? "—")})
          </div>
        </div>

        <div className="h-px bg-rcn-border my-3"></div>

        <div className="mb-4">
          <div className="text-xs text-rcn-muted mb-1">Status</div>
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border ${getStatusClass(refStatus)}`}>
            {refStatus}
          </span>
        </div>

        <div className="mb-4">
          <div className="text-xs text-rcn-muted mb-1">Services Requested</div>
          <div className="text-sm bg-[#f6fbf7] border border-rcn-border rounded-xl p-3">
            {(ref.services as string) ?? (Array.isArray((ref.servicesData as Record<string, unknown>)?.requested) ? ((ref.servicesData as Record<string, unknown>).requested as string[]).join("; ") : "—")}
          </div>
        </div>

        <div className="mb-4">
          <div className="text-xs text-rcn-muted mb-1">Notes</div>
          <div className="text-sm bg-[#f6fbf7] border border-rcn-border rounded-xl p-3">
            {(ref.notes as string) ?? (ref.servicesData as Record<string, unknown>)?.otherInformation ?? "No notes provided."}
          </div>
        </div>

        <div className="h-px bg-rcn-border my-3"></div>

        <div className="text-xs text-rcn-muted mb-2">Billing Status</div>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-[#f6fbf7] border border-rcn-border rounded-lg p-2 text-xs">
            <div className="font-semibold mb-1">Sender</div>
            <div>Send charged: {billing?.senderSendCharged ? "✅ Yes" : "❌ No"}</div>
            <div>Credit used: {billing?.senderUsedCredit ? "✅ Yes" : "❌ No"}</div>
          </div>
          <div className="bg-[#f6fbf7] border border-rcn-border rounded-lg p-2 text-xs">
            <div className="font-semibold mb-1">Receiver</div>
            <div>Open charged: {billing?.receiverOpenCharged ? "✅ Yes" : "❌ No"}</div>
            <div>Credit used: {billing?.receiverUsedCredit ? "✅ Yes" : "❌ No"}</div>
          </div>
        </div>

        {isReceiver && refStatus === "Pending" && (
          <>
            <div className="h-px bg-rcn-border my-3"></div>
            <div className="flex gap-2">
              <Button
                variant="primary"
                onClick={() => {
                  toastWarning("Accept/Reject functionality will be available with API integration.");
                  closeModal();
                }}
                className="logo-gradient text-white border-0 px-4 py-2.5 rounded-xl cursor-pointer font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Accept Referral
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  toastWarning("Accept/Reject functionality will be available with API integration.");
                  closeModal();
                }}
              >
                Reject Referral
              </Button>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <>
      <StatsCards />

      <div className="h-px bg-rcn-border my-3.5"></div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 items-start">
        <SenderSection
          orgs={orgs}
          onViewReferral={(ref) => handleViewReferral(ref, false)}
        />
        <ReceiverSection
          orgs={orgs}
          onViewReferral={(ref) => handleViewReferral(ref, true)}
        />
      </div>

      {/* Modal */}
      {modalContent && (
        <div 
          className="fixed inset-0 bg-black/55 flex items-center justify-center p-5 z-50" 
          onClick={(e) => {
            if ((e.target as HTMLElement).classList.contains('bg-black/55')) {
              closeModal();
            }
          }}
        >
          <div className="max-w-[900px] w-full">
            <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4 max-h-[80vh] overflow-auto">
              {modalContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
