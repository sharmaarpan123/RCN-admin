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

/** Referral item from GET /api/organization/referral/by-organization (sender list). */
export type SenderReferralRow = {
  _id: string;
  createdAt?: string;
  sent_at?: string;
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

export interface SenderSectionProps {
  onViewReferral: (ref: Record<string, unknown>, isReceiver: false) => void;
}

const PAGE_SIZE = 10;

type StatusFilter = "all" | "draft" | "sent";

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
];

export function SenderSection({  onViewReferral }: SenderSectionProps) {
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
    queryKey: [...defaultQueryKeys.referralByOrganization, "sender", selectedOrgId, page, statusFilter],
    queryFn: async () => {
      if (!selectedOrgId) return { data: [], meta: null };
      const res = await getOrganizationReferralByOrganizationApi({
        organization_id: selectedOrgId,
        type: "sender",
        status: statusFilter,
        page,
        limit: PAGE_SIZE,
      });
      if (!checkResponse({ res })) return { data: [], meta: null };
      return res.data as { data?: SenderReferralRow[]; meta?: ReferralListMeta };
    },
    enabled: !!selectedOrgId,
  });

  const referrals = (referralsRes?.data ?? []) as SenderReferralRow[];
  const meta = referralsRes?.meta as ReferralListMeta | undefined;
  const total = meta?.total ?? 0;

  const columns: TableColumn<SenderReferralRow>[] = useMemo(
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
        head: "Receiver",
        component: (row) => {
          const depts = row.department_statuses ?? [];
          const guests = row.guest_organization_statuses ?? [];
          const n = depts.length + guests.length;
          const label = `${n} receivers`;
          return <span className="text-xs">{label}</span>;
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
        component: (row) => (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewReferral(row as unknown as Record<string, unknown>, false);
            }}
            className="border border-rcn-border bg-white px-2 py-1.5 rounded-lg cursor-pointer font-semibold text-rcn-text text-xs hover:border-[#c9ddd0] transition-colors"
          >
            View
          </button>
        ),
      },
    ],
    [onViewReferral]
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
          Select an organization to view sent referrals.
        </div>
      ) : (
        <>
          <TableLayout<SenderReferralRow>
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
