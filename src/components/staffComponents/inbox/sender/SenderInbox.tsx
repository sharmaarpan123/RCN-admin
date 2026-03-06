"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import type {
  SentReferralApi,
  ReferralListMeta,
  DepartmentStatus,
} from "@/app/staff-portal/inbox/types";
import { pillClass, pillLabel } from "@/app/staff-portal/inbox/helpers";
import {
  Button,
  DebouncedInput,
  TableLayout,
  type TableColumn,
} from "@/components";
import CustomPagination from "@/components/CustomPagination";
import {
  SenderInboxBody,
  SenderInboxType,
} from "@/app/staff-portal/inbox/page";
import moment from "moment";
import { useStaffAuthLoginUser } from "@/store/slices/Auth/hooks";
import { StaffProfileData } from "@/app/staff-portal/types/profile";
import { department_status_type } from "@/app/staff-portal/inbox/receiver/[id]/page";

function sentReferralStatus(
  ref: SentReferralApi,
  loginUser: StaffProfileData,
): string {
  if (ref.is_draft) return "DRAFT";
  const receiverDepartmentIds =
    loginUser?.user_departments?.map((d) => d._id) ?? [];

  const department_status = ref.department_statuses?.find(
    (d: DepartmentStatus) =>
      receiverDepartmentIds.includes(d.department_id ?? ""),
  ) as department_status_type;
  return department_status?.status ?? "SENT";
}

interface SenderInboxProps {
  referrals: SentReferralApi[];

  meta: ReferralListMeta;
  isLoading?: boolean;
  body: SenderInboxBody;
  setBody: React.Dispatch<React.SetStateAction<SenderInboxBody>>;
}

export function SenderInbox({
  body,
  setBody,
  referrals,
  meta,
  isLoading = false,
}: SenderInboxProps) {
  const router = useRouter();
  const baseList = referrals;
  const { loginUser } = useStaffAuthLoginUser();

  const columns: TableColumn<SentReferralApi>[] = useMemo(
    () => [
      {
        head: "Referral ID",
        component: (ref) => {
          return (
            <span className="text-rcn-muted text-xs font-semibold">
              {ref.referral_code}
            </span>
          );
        },
      },
      {
        head: "Patient",
        component: (ref) => {
          const p = ref.patient;
          const last = p?.patient_last_name ?? "";
          const first = p?.patient_first_name ?? "";
          const name = `${first} ${last}`.trim() || "N/A";
          const dob = p?.dob ? moment(p.dob).format("MM/DD/YYYY") : "";
          return (
            <span className="font-semibold text-[13px]">
              {name} {dob ? `• DOB ${dob || "N/A"}` : ""}
            </span>
          );
        },
      },
      {
        head: "Services",
        component: (ref) => {
          const ids = ref.speciality_ids ?? [];
          const extra = ref.additional_speciality ?? [];
          const label = (ids?.length || 0) + (extra?.length || 0);
          return (
            <span className="text-rcn-muted text-xs font-semibold">
              {label} services
            </span>
          );
        },
      },
      {
        head: "Receivers",
        component: (ref) => {
          console.log(ref, "ref");
          const totalReceivers = [
            ...(ref.guest_organizations || []),
            ...ref.department_ids,
          ];
          const n = totalReceivers.length;
          const label = `${n} receivers`;
          return (
            <span className="text-rcn-muted text-xs font-semibold">
              {label}
            </span>
          );
        },
      },
      {
        head: "Status",
        component: (ref) => {
          const st = sentReferralStatus(ref, loginUser);
          return (
            <span
              className={`inline-flex capitalize items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-black border ${pillClass(st)}`}
            >
              {pillLabel(st)}
            </span>
          );
        },
      },
      {
        head: "Sent Date",
        component: (ref) => {
          const d = ref.sent_at
            ? new Date(ref.sent_at)
            : ref.createdAt
              ? new Date(ref.createdAt)
              : null;
          return (
            <span className="text-rcn-muted text-xs font-semibold">
              {d ? moment(d).format("DD/MM/YYYY , hh:mm a") : "—"}
            </span>
          );
        },
      },
      {
        head: "Actions",
        component: (ref) => (
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() =>
                router.push(`/staff-portal/inbox/sender/${ref._id}`)
              }
              className="border border-rcn-brand/25 text-rcn-accent-dark px-2 py-1.5 rounded-xl font-extrabold text-xs shadow mr-1"
            >
              View
            </Button>
          </div>
        ),
      },
    ],
    [router, loginUser],
  );

  return (
    <>
      <section
        className="mt-3.5 border border-slate-200 bg-white/65 rounded-2xl shadow-[0_10px_30px_rgba(2,6,23,.07)] overflow-hidden"
        aria-label="Sender inbox list"
      >
        <div className="p-3.5 pt-3 pb-2.5 border-b border-slate-200 bg-white/90">
          <h2 className="m-0 text-sm font-semibold tracking-wide">
            Sender Inbox
          </h2>
        </div>
        <div className="flex flex-col gap-2.5 p-3 border-b border-slate-200 bg-white/90">
          <DebouncedInput
            id="sender-inbox-search"
            value={body.search}
            onChange={(value) => setBody({ ...body, search: value })}
            placeholder="Search patient, referral ID..."
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-[13px] text-rcn-text"
            aria-label="Search inbox"
          />
          <div className="flex gap-2 flex-wrap" aria-label="Status filters">
            {[
              { label: "ALL", value: "all" as SenderInboxType },
              { label: "DRAFT", value: "draft" as SenderInboxType },
              { label: "SENT", value: "sent" as SenderInboxType },
            ].map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() =>
                  setBody({ ...body, type: f.value as SenderInboxType })
                }
                className={`inline-flex items-center gap-1.5 px-2.5 py-2 rounded-full border cursor-pointer text-xs font-semibold select-none ${body.type === f.value ? "bg-rcn-brand/10 border-rcn-brand/20 text-rcn-accent-dark" : "border-slate-200 bg-white text-rcn-muted"}`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap" aria-label="Date filters">
            {[
              [30, "Last 30 days"],
              [7, "Last 7 days"],
              [90, "Last 90 days"],
              [0, "All time"],
            ].map(([days, label]) => (
              <button
                key={String(days)}
                type="button"
                onClick={() => setBody((p) => ({ ...p, day: Number(days) }))}
                className={`inline-flex items-center gap-1.5 px-2.5 py-2 rounded-full border cursor-pointer text-xs font-semibold select-none ${body.day === Number(days) ? "bg-rcn-brand/10 border-rcn-brand/20 text-rcn-accent-dark" : "border-slate-200 bg-white text-rcn-muted"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-auto max-w-full">
          <TableLayout<SentReferralApi>
            columns={columns}
            data={baseList}
            size="sm"
            loader={isLoading}
            tableClassName="[&_thead_tr]:bg-rcn-brand/10 [&_th]:border-slate-200 [&_th]:border-b [&_td]:border-slate-200 [&_td]:border-b [&_tr]:border-slate-200 [&_tr:hover]:bg-slate-50/50"
            getRowKey={(ref) => ref._id}
            emptyMessage="No referrals match your filters."
          />
          <CustomPagination
            total={meta.total}
            pageSize={meta.limit}
            current={meta.page}
            onChange={(page) => setBody({ ...body, page })}
          />
        </div>
      </section>
    </>
  );
}
