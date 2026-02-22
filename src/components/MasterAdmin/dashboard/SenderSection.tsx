"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CustomAsyncSelect } from "@/components";
import type { RcnSelectOption } from "@/components/CustomAsyncSelect";
import { getAdminOrganizationsApi, getOrganizationReferralByOrganizationApi } from "@/apis/ApiCalls";
import { checkResponse } from "@/utils/commonFunc";
import defaultQueryKeys from "@/utils/adminQueryKeys";
import { fmtDate } from "@/utils/database";
import type { AdminOrganizationListItem } from "@/components/MasterAdmin/Organizations/types";

export type DashboardOrg = {
  id: string;
  name: string;
  address: { state: string; zip: string };
};

function getStatusClass(status: string) {
  if (status === "Accepted") return "border-[#b9e2c8] bg-[#f1fbf5] text-[#0b5d36]";
  if (status === "Rejected") return "border-[#f3b8b8] bg-[#fff1f2] text-[#991b1b]";
  if (status === "Pending") return "border-[#f3d9a1] bg-[#fff8e6] text-[#7a4a00]";
  return "";
}

export interface SenderSectionProps {
  orgs: DashboardOrg[];
  onViewReferral: (ref: Record<string, unknown>, isReceiver: false) => void;
}

export function SenderSection({ orgs, onViewReferral }: SenderSectionProps) {
  const [selectedOption, setSelectedOption] = useState<RcnSelectOption[]>([]);
  const selectedOrgId = selectedOption[0]?.value ?? "";
  const selectedOrgName = selectedOption[0]?.label ?? "";

  const loadOptions = useCallback(async (inputValue: string): Promise<RcnSelectOption[]> => {
    const res = await getAdminOrganizationsApi({
      search: inputValue.trim() || undefined,
      limit: 50,
    });
    if (!checkResponse({ res })) return [];
    const raw = res.data as { data?: AdminOrganizationListItem[] };
    const list = raw?.data ?? [];
    return list
      .map((o) => {
        const id = o.organization_id ?? o._id ?? "";
        const label = o.organization?.name ?? "";
        return id && label ? { value: id, label } : null;
      })
      .filter((x): x is RcnSelectOption => x != null);
  }, []);

  const handleChange = useCallback((options: RcnSelectOption[]) => {
    setSelectedOption(options.length ? [options[0]] : []);
  }, []);

  const { data: referralsRes, isLoading } = useQuery({
    queryKey: [...defaultQueryKeys.referralByOrganization, "sender", selectedOrgId],
    queryFn: async () => {
      if (!selectedOrgId) return { data: [], meta: null };
      const res = await getOrganizationReferralByOrganizationApi({
        organization_id: selectedOrgId,
        type: "sender",
        status: "all",
        page: 1,
        limit: 100,
      });
      if (!checkResponse({ res })) return { data: [], meta: null };
      return res.data as { data?: unknown[]; meta?: unknown };
    },
    enabled: !!selectedOrgId,
  });

  const referrals = useMemo(
    () => ((referralsRes?.data ?? []) as Record<string, unknown>[]).sort((a, b) =>
      new Date((b.createdAt ?? b.created_at) as string).getTime() -
      new Date((a.createdAt ?? a.created_at) as string).getTime()
    ),
    [referralsRes?.data]
  );

  return (
    <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="m-0 text-sm font-semibold">Sender Inbox</h3>
        {selectedOrgId && (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border border-rcn-border bg-[#f8fcf9]">
            {selectedOrgName}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5 mb-3">
        <label className="text-xs text-rcn-muted font-semibold">Organization</label>
        <CustomAsyncSelect
          value={selectedOption}
          onChange={handleChange}
          loadOptions={loadOptions}
          placeholder="Type to search organizations..."
          aria-label="Sender organization"
          defaultOptions={true}
          maxMenuHeight={280}
        />
      </div>

      {!selectedOrgId ? (
        <div className="text-xs text-rcn-muted p-2.5 border border-dashed border-rcn-border rounded-xl">
          Select an organization to view sent referrals.
        </div>
      ) : (
        <div className="overflow-auto">
          <table className="w-full border-separate border-spacing-0 overflow-hidden rounded-2xl border border-rcn-border">
            <thead>
              <tr>
                <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">
                  ID
                </th>
                <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">
                  Date
                </th>
                <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">
                  Receiver
                </th>
                <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">
                  Status
                </th>
                <th className="px-2.5 py-2.5 border-b border-rcn-border text-xs text-left align-top bg-[#f6fbf7] text-rcn-dark-bg uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-2.5 py-2.5 text-xs text-rcn-muted">
                    Loading…
                  </td>
                </tr>
              ) : referrals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-2.5 py-2.5 text-xs text-rcn-muted">
                    No referrals found.
                  </td>
                </tr>
              ) : (
                referrals.map((ref) => {
                  const refId = (ref.id ?? ref._id) as string;
                  const receiverId = (ref.receiverOrgId ?? ref.receiver_organization_id ?? ref.receiver_org_id) as string;
                  const receiver = orgs.find((o) => o.id === receiverId);
                  const patient = (ref.patient ?? ref.patient_info) as Record<string, unknown> | undefined;
                  const status = (ref.status ?? ref.referral_status) as string;
                  return (
                    <tr key={refId}>
                      <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top font-mono">
                        {refId}
                      </td>
                      <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">
                        {fmtDate((ref.createdAt ?? ref.created_at) as string)}
                      </td>
                      <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">
                        {String(patient?.last ?? patient?.last_name ?? "—")}, {String(patient?.first ?? patient?.first_name ?? "—")}
                        <div className="text-rcn-muted">
                          {String(patient?.dob ?? "—")} • {String(patient?.gender ?? "—")}
                        </div>
                      </td>
                      <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">
                        {String(receiver?.name ?? "—")}
                        <div className="text-rcn-muted">
                          {receiver ? `${receiver.address?.state ?? ""} ${receiver.address?.zip ?? ""}` : ""}
                        </div>
                      </td>
                      <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border ${getStatusClass(status)}`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="px-2.5 py-2.5 border-b border-rcn-border text-xs align-top">
                        <button
                          type="button"
                          onClick={() => onViewReferral(ref, false)}
                          className="border border-rcn-border bg-white px-2 py-1.5 rounded-lg cursor-pointer font-semibold text-rcn-text text-xs hover:border-[#c9ddd0] transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
