"use client";

import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { TableColumn } from "@/components";
import { Button, DebouncedInput, TableLayout } from "@/components";
import CustomPagination from "@/components/CustomPagination";
import { getAuthProfileApi, getOrganizationReferralByOrganizationApi } from "@/apis/ApiCalls";
import { checkResponse } from "@/utils/commonFunc";
import { fmtDate } from "@/utils/database";
import type { AuthProfileData } from "../types/profile";
import { ReferralViewModal } from "@/components/MasterAdmin/dashboard/Modals/ReferralViewModal";
import type { DashboardOrg } from "@/components/MasterAdmin/dashboard/Modals/ReferralViewModal";
import { useOrganizationAuthLoginUser } from "@/store/slices/Auth/hooks";

type InboxRefMode = "sent" | "received";

type SenderStatusFilter = "all" | "draft" | "sent";
type ReceiverStatusFilter = "all" | "pending" | "accepted" | "rejected" | "paid";

const PAGE_SIZE = 10;

type ReferralRow = {
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
  is_draft?: boolean;
  sender_organization_id?: string;
  senderOrgId?: string;
  sender_org_id?: string;
  [key: string]: unknown;
};

type ReferralListMeta = {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
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

function mapProfileToOrgs(profile: AuthProfileData | null | undefined): DashboardOrg[] {
  if (!profile?.organization) return [];
  const org = profile.organization;
  return [
    {
      id: org._id ?? "",
      name: org.name ?? "",
      address: { state: org.state ?? "", zip: org.zip_code ?? "" },
    },
  ];
}

export default function OrgPortalReferralDashboardPage() {
  const [inboxRefMode, setInboxRefMode] = useState<InboxRefMode>("received");
  const [search, setSearch] = useState("");
  const [senderStatusFilter, setSenderStatusFilter] = useState<SenderStatusFilter>("all");
  const [receiverStatusFilter, setReceiverStatusFilter] = useState<ReceiverStatusFilter>("all");
  const [page, setPage] = useState(1);
  const [modalRef, setModalRef] = useState<Record<string, unknown> | null>(null);
  const [modalIsReceiver, setModalIsReceiver] = useState(false);
  const { loginUser } = useOrganizationAuthLoginUser();

  const { data: profileData } = useQuery({
    queryKey: ["auth", "profile"],
    queryFn: async () => {
      const res = await getAuthProfileApi();
      if (!checkResponse({ res })) return null;
      return res.data as AuthProfileData | null;
    },
  });


  const orgs = useMemo(() => mapProfileToOrgs(profileData), [profileData]);

  const isSent = inboxRefMode === "sent";
  const statusParam = isSent ? senderStatusFilter : receiverStatusFilter;

  const ownOrgId = loginUser?.organization_id?._id;

  const { data: referralsRes, isLoading } = useQuery({
    queryKey: ["organization", "referral", "by-org", ownOrgId, inboxRefMode, statusParam, page],
    queryFn: async () => {
      if (!ownOrgId) return { data: [], meta: null };
      const res = await getOrganizationReferralByOrganizationApi({
        organization_id: ownOrgId,
        type: isSent ? "sender" : "receiver",
        status: statusParam,
        page,
        limit: PAGE_SIZE,
      });
      if (!checkResponse({ res })) return { data: [], meta: null };
      return res.data as { data?: ReferralRow[]; meta?: ReferralListMeta };
    },
    enabled: !!ownOrgId,
  });

  const meta = referralsRes?.meta as ReferralListMeta | undefined;
  const total = meta?.total ?? 0;

  const filtered = useMemo(() => {
    const list = (referralsRes?.data ?? []) as ReferralRow[];
    if (!search.trim()) return list;
    const q = search.trim().toLowerCase();
    return list.filter((r) => {
      const p = r.patient;
      const name = [p?.patient_last_name, p?.patient_first_name].filter(Boolean).join(" ").toLowerCase();
      const services = (r.speciality_ids as { name?: string }[] ?? []).map((s) => s.name).filter(Boolean).join(" ").toLowerCase();
      const id = (r._id ?? "").toString().toLowerCase();
      const facility = (r.facility_name ?? "").toString().toLowerCase();
      return name.includes(q) || services.includes(q) || id.includes(q) || facility.includes(q);
    });
  }, [referralsRes?.data, search]);

  const columns: TableColumn<ReferralRow>[] = useMemo(
    () =>
      isSent
        ? [
          {
            head: "Date",
            component: (row) => <span className="text-xs">{fmtDate((row.sent_at ?? row.createdAt) as string)}</span>,
          },
          {
            head: "Patient",
            component: (row) => {
              const p = row.patient;
              const name = `${p?.patient_last_name ?? ""}, ${p?.patient_first_name ?? ""}`.trim() || "—";
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
              return <span className="text-xs">{n} receivers</span>;
            },
          },
          {
            head: "Status",
            component: (row) => {
              const depts = row.department_statuses ?? [];
              const status = depts[0]?.status ?? (row.is_draft ? "draft" : "sent");
              return (
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border ${getStatusClass(status)}`}>
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
                  setModalRef(row as unknown as Record<string, unknown>);
                  setModalIsReceiver(false);
                }}
                className="border border-rcn-border bg-white px-2 py-1.5 rounded-lg cursor-pointer font-semibold text-rcn-text text-xs hover:border-[#c9ddd0] transition-colors"
              >
                View
              </button>
            ),
          },
        ]
        : [
          {
            head: "Date",
            component: (row) => <span className="text-xs">{fmtDate((row.sent_at ?? row.createdAt) as string)}</span>,
          },
          {
            head: "Patient",
            component: (row) => {
              const p = row.patient;
              const name = `${p?.patient_last_name ?? ""}, ${p?.patient_first_name ?? ""}`.trim() || "—";
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
            component: (row) => (
              <span className="text-xs">{(row.facility_name as string) ?? "—"}</span>
            ),
          },
          {
            head: "Status",
            component: (row) => {
              const depts = row.department_statuses ?? [];
              const status = depts[0]?.status ?? (row.is_draft ? "draft" : "sent");
              return (
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border ${getStatusClass(status)}`}>
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
              return (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setModalRef(row as unknown as Record<string, unknown>);
                    setModalIsReceiver(true);
                  }}
                  className={
                    opened
                      ? "border border-rcn-border bg-white px-2 py-1.5 rounded-lg cursor-pointer font-semibold text-rcn-text text-xs hover:border-[#c9ddd0] transition-colors"
                      : "logo-gradient text-white border-0 px-2 py-1.5 rounded-lg cursor-pointer font-semibold text-xs hover:opacity-90 transition-opacity"
                  }
                >
                  {opened ? "View" : "Open"}
                </button>
              );
            },
          },
        ],
    [isSent]
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center justify-between gap-4 mb-4">
        <div className="min-w-0">
          <h1 className="text-xl font-bold m-0">Referral Dashboard</h1>
          <p className="text-sm text-rcn-muted m-0 mt-0.5">View organization-wide Sender and Receiver inboxes.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold px-2 py-1 rounded-full border border-rcn-accent/40 text-rcn-accent bg-rcn-accent/10">
            Sent: {isSent ? total : "—"}
          </span>
          <span className="text-xs font-bold px-2 py-1 rounded-full border border-rcn-accent/40 text-rcn-accent bg-rcn-accent/10">
            Received: {!isSent ? total : "—"}
          </span>
        </div>
      </div>

      <div className="bg-rcn-card border border-rcn-border rounded-2xl shadow-rcn overflow-hidden">
        <div className="p-4 space-y-3">
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => { setInboxRefMode("sent"); setPage(1); }}
              className={`flex-1 min-w-0 sm:flex-initial px-3 py-2 rounded-xl border text-sm font-bold transition-all ${inboxRefMode === "sent" ? "border-rcn-accent/60 bg-rcn-accent/10 text-rcn-accent" : "border-rcn-border bg-white hover:border-rcn-accent/40"}`}
            >
              Sender Inbox <small className="text-rcn-muted font-semibold">Referrals Sent</small>
            </button>
            <button
              type="button"
              onClick={() => { setInboxRefMode("received"); setPage(1); }}
              className={`flex-1 min-w-0 sm:flex-initial px-3 py-2 rounded-xl border text-sm font-bold transition-all ${inboxRefMode === "received" ? "border-rcn-accent/60 bg-rcn-accent/10 text-rcn-accent" : "border-rcn-border bg-white hover:border-rcn-accent/40"}`}
            >
              Receiver Inbox <small className="text-rcn-muted font-semibold">Referrals Received</small>
            </button>
          </div>

          {isSent ? (
            <div className="flex gap-2 flex-wrap">
              {(["all", "draft", "sent"] as const).map((value) => (
                <Button
                  key={value}
                  variant="tab"
                  size="sm"
                  active={senderStatusFilter === value}
                  onClick={() => { setSenderStatusFilter(value); setPage(1); }}
                >
                  {value === "all" ? "All" : value === "draft" ? "Draft" : "Sent"}
                </Button>
              ))}
            </div>
          ) : (
            <div className="flex gap-2 flex-wrap">
              {(["all", "pending", "accepted", "rejected", "paid"] as const).map((value) => (
                <Button
                  key={value}
                  variant="tab"
                  size="sm"
                  active={receiverStatusFilter === value}
                  onClick={() => { setReceiverStatusFilter(value); setPage(1); }}
                >
                  {value === "all" ? "All" : value.charAt(0).toUpperCase() + value.slice(1)}
                </Button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-rcn-muted mb-1.5">Search</label>
              <DebouncedInput
                value={search}
                onChange={(value) => setSearch(value)}
                placeholder="Search patient / organization / service..."
                debounceMs={300}
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => { setSearch(""); setPage(1); }}
              >
                Clear Filters
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-rcn-border">
            <TableLayout<ReferralRow>
              columns={columns}
              data={filtered}
              loader={isLoading}
              emptyMessage="No referrals found."
              wrapperClassName="min-w-[520px]"
              getRowKey={(r) => r._id}
              variant="bordered"
              size="sm"
              onRowClick={(r) => {
                setModalRef(r as unknown as Record<string, unknown>);
                setModalIsReceiver(!isSent);
              }}
            />
          </div>

          {total > 0 && (
            <CustomPagination
              total={total}
              pageSize={PAGE_SIZE}
              current={page}
              onChange={(p) => setPage(p)}
            />
          )}
        </div>
      </div>

      <ReferralViewModal
        isOpen={modalRef !== null}
        onClose={() => setModalRef(null)}
        refData={modalRef}

        isReceiver={modalIsReceiver}
      />
    </div>
  );
}
