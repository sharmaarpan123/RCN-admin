"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, CustomAsyncSelect, TableLayout, type TableColumn } from "@/components";
import CustomPagination from "@/components/CustomPagination";
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

/** Referral item from GET /api/organization/referral/by-organization (receiver list). */
export type ReceiverReferralRow = {
  _id: string;
  createdAt?: string;
  sent_at?: string;
  facility_name?: string;
  patient?: {
    patient_first_name?: string;
    patient_last_name?: string;
    dob?: string;
    gender?: string;
  };
  department_statuses?: Array<{
    status?: string;
    department?: { name?: string; organization_id?: string };
  }>;
  guest_organization_statuses?: Array<{ company_name?: string }>;
  billing?: { receiverOpenCharged?: boolean };
  [key: string]: unknown;
};

type ReferralListMeta = {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
};

function getStatusClass(status: string) {
  const s = (status ?? "").toLowerCase();
  if (s === "accepted" || s === "active") return "border-[#b9e2c8] bg-[#f1fbf5] text-[#0b5d36]";
  if (s === "rejected") return "border-[#f3b8b8] bg-[#fff1f2] text-[#991b1b]";
  if (s === "pending") return "border-[#f3d9a1] bg-[#fff8e6] text-[#7a4a00]";
  return "border-rcn-border bg-[#f8fcf9] text-rcn-muted";
}

function displayStatus(status: string) {
  const s = (status ?? "").toLowerCase();
  if (s === "active") return "Accepted";
  return (status ?? "—").charAt(0).toUpperCase() + (status ?? "").slice(1);
}

export interface ReceiverSectionProps {
  orgs: DashboardOrg[];
  onViewReferral: (ref: Record<string, unknown>, isReceiver: true) => void;
}

const PAGE_SIZE = 10;

type StatusFilter = "all" | "pending" | "accepted" | "rejected" | "paid";

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "paid", label: "Paid" },
];

export function ReceiverSection({ orgs, onViewReferral }: ReceiverSectionProps) {
  const [selectedOption, setSelectedOption] = useState<RcnSelectOption[]>([]);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
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
    setPage(1);
  }, []);

  const setStatus = useCallback((status: StatusFilter) => {
    setStatusFilter(status);
    setPage(1);
  }, []);

  const { data: referralsRes, isLoading } = useQuery({
    queryKey: [...defaultQueryKeys.referralByOrganization, "receiver", selectedOrgId, page, statusFilter],
    queryFn: async () => {
      if (!selectedOrgId) return { data: [], meta: null };
      const res = await getOrganizationReferralByOrganizationApi({
        organization_id: selectedOrgId,
        type: "receiver",
        status: statusFilter,
        page,
        limit: PAGE_SIZE,
      });
      if (!checkResponse({ res })) return { data: [], meta: null };
      return res.data as { data?: ReceiverReferralRow[]; meta?: ReferralListMeta };
    },
    enabled: !!selectedOrgId,
  });

  const referrals = (referralsRes?.data ?? []) as ReceiverReferralRow[];
  const meta = referralsRes?.meta as ReferralListMeta | undefined;
  const total = meta?.total ?? 0;

  const columns: TableColumn<ReceiverReferralRow>[] = useMemo(
    () => [
    
      {
        head: "Date",
        component: (row) => (
          <span className="text-xs">
            {fmtDate((row.sent_at ?? row.createdAt) as string)}
          </span>
        ),
      },
      {
        head: "Patient",
        component: (row) => {
          const p = row.patient;
          const last = p?.patient_last_name ?? "";
          const first = p?.patient_first_name ?? "";
          const name = `${last}, ${first}`.trim() || "—";
          const sub = [p?.dob, p?.gender].filter(Boolean).join(" • ") || "";
          return (
            <div className="text-xs">
              <div>{name}</div>
              {sub ? <div className="text-rcn-muted">{sub}</div> : null}
            </div>
          );
        },
      },
      {
        head: "Sender",
        component: (row) => {
          const senderId = (row.sender_organization_id ?? row.senderOrgId ?? row.sender_org_id) as string | undefined;
          const sender = senderId ? orgs.find((o) => o.id === senderId) : null;
          const label = sender?.name ?? (row.facility_name as string) ?? "—";
          const sub = sender ? `${sender.address?.state ?? ""} ${sender.address?.zip ?? ""}`.trim() : "";
          return (
            <div className="text-xs">
              <div>{label}</div>
              {sub ? <div className="text-rcn-muted">{sub}</div> : null}
            </div>
          );
        },
      },
      {
        head: "Status",
        component: (row) => {
          const depts = row.department_statuses ?? [];
          const first = depts[0]?.status;
          const status = first ?? (row.is_draft ? "draft" : "sent");
          return (
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border ${getStatusClass(status)}`}
            >
              {displayStatus(status)}
            </span>
          );
        },
      },
      {
        head: "Actions",
        component: (row) => {
          const billing = row.billing as { receiverOpenCharged?: boolean } | undefined;
          const opened = billing?.receiverOpenCharged;
          const label = opened ? "View" : "Open";
          return (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onViewReferral(row as unknown as Record<string, unknown>, true);
              }}
              className={
                opened
                  ? "border border-rcn-border bg-white px-2 py-1.5 rounded-lg cursor-pointer font-semibold text-rcn-text text-xs hover:border-[#c9ddd0] transition-colors"
                  : "logo-gradient text-white border-0 px-2 py-1.5 rounded-lg cursor-pointer font-semibold text-xs hover:opacity-90 transition-opacity"
              }
            >
              {label}
            </button>
          );
        },
      },
    ],
    [orgs, onViewReferral]
  );

  return (
    <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="m-0 text-sm font-semibold">Receiver Inbox</h3>
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
          aria-label="Receiver organization"
          defaultOptions={true}
          maxMenuHeight={280}
        />
      </div>

      {selectedOrgId && (
        <div className="flex gap-2 flex-wrap mb-3">
          {STATUS_TABS.map(({ value, label }) => (
            <Button
              key={value}
              variant="tab"
              size="sm"
              active={statusFilter === value}
              onClick={() => setStatus(value)}
            >
              {label}
            </Button>
          ))}
        </div>
      )}

      {!selectedOrgId ? (
        <div className="text-xs text-rcn-muted p-2.5 border border-dashed border-rcn-border rounded-xl">
          Select an organization to view received referrals.
        </div>
      ) : (
        <>
          <TableLayout<ReceiverReferralRow>
            columns={columns}
            data={referrals}
            loader={isLoading}
            emptyMessage="No referrals found."
            getRowKey={(row) => row._id}
            variant="bordered"
            size="sm"
          />
          {total > 0 && (
            <CustomPagination
              total={total}
              pageSize={PAGE_SIZE}
              current={page}
              onChange={(p) => setPage(p)}
            />
          )}
        </>
      )}
    </div>
  );
}
