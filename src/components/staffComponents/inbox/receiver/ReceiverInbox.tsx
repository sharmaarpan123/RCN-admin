"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import type { ReceivedReferralApi, ReferralListMeta } from "@/app/staff-portal/inbox/types";
import { fmtDate, pillClass, pillLabel } from "@/app/staff-portal/inbox/helpers";
import { ReceiverInboxBody, ReceiverInboxType } from "@/app/staff-portal/inbox/page";
import { Button, DebouncedInput, TableLayout, type TableColumn } from "@/components";
import CustomPagination from "@/components/CustomPagination";
import moment from "moment";

function receivedReferralStatus(ref: ReceivedReferralApi): string {
  const statuses = ref.department_statuses as { status?: string }[] | undefined;
  if (Array.isArray(statuses) && statuses.length > 0) {
    const first = statuses[0]?.status;
    if (first) return first;
  }
  return "PENDING";
}

interface ReceiverInboxProps {
  referrals: ReceivedReferralApi[];
  body: ReceiverInboxBody;
  setBody: React.Dispatch<React.SetStateAction<ReceiverInboxBody>>;
  meta: ReferralListMeta;
  isLoading?: boolean;
}

export function ReceiverInbox({
  referrals,
  body,
  setBody,
  meta,
  isLoading = false,
}: ReceiverInboxProps) {
  const router = useRouter();

  const baseList = referrals

  const receiverBodyList = useMemo(() => {
    const q = (body.search ?? "").trim().toLowerCase();
    if (!q) return baseList;
    return baseList.filter((ref) => {
      const p = ref.patient;
      const last = p?.patient_last_name ?? "";
      const first = p?.patient_first_name ?? "";
      const dob = p?.dob ?? "";
      const patient = `${last} ${first} ${dob}`.toLowerCase();
      const id = (ref._id ?? "").toLowerCase();
      return `${id} ${patient}`.includes(q);
    });
  }, [baseList, body.search]);

  const columns: TableColumn<ReceivedReferralApi>[] = useMemo(
    () => [
      {
        head: "Referral ID",
        component: (ref) => {
          return <span className="text-rcn-muted text-xs font-semibold">{ref._id}</span>;
        },
      },
       {
        head: "Patient",
        component: (ref) => {
          const p = ref.patient;
          const last = p?.patient_last_name ?? "";
          const first = p?.patient_first_name ?? "";
          const name = `${last} ${first}`.trim() || "N/A";
          const dob = p?.dob ? moment(p.dob).format("DD , MM , YYYY") : "";
          return <span className="font-semibold text-[13px]">{`${name} ${dob ? `• DOB ${dob || "N/A"}` : ""}`}</span>;
        },
      },
      {
        head: "Services",
        component: (ref) => {
          const ids = ref.speciality_ids ?? [];
          const extra = ref.additional_speciality ?? [];
          const label = ids.length > 0 ? `${ids.length} service(s)` : extra.length > 0 ? (extra[0] as { name?: string })?.name ?? "—" : "—";
          return <span className="text-rcn-muted text-xs font-semibold">{label}</span>;
        },
      },
      {
        head: "Status",
        component: (ref) => {
          const st = receivedReferralStatus(ref);
          return (
            <span className={`inline-flex capitalize items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-black border ${pillClass(st)}`}>
              {pillLabel(st)}
            </span>
          );
        },
      },
      {
        head: "Sent Date",
        component: (ref) => {
          const d = ref.sent_at ? new Date(ref.sent_at) : ref.createdAt ? new Date(ref.createdAt) : null;
          return <span className="text-rcn-muted text-xs font-semibold">{d ? moment(d).format("DD , MM , YYYY , hh:mm a") : "—"}</span>;
        },
      },
      {
        head: "Actions",
        component: (ref) => (
          <div onClick={(e) => e.stopPropagation()}>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => router.push(`/staff-portal/inbox/receiver/${ref._id}`)}
              className="border border-rcn-brand/25 text-rcn-accent-dark px-2 py-1.5 rounded-xl font-extrabold text-xs shadow"
            >
              View
            </Button>
          </div>
        ),
      },
    ],
    [router]
  );

  return (
    <section className="mt-3.5 border border-slate-200 bg-white/65 rounded-2xl shadow-[0_10px_30px_rgba(2,6,23,.07)] overflow-hidden" aria-label="Receiver inbox list">
      <div className="p-3.5 pt-3 pb-2.5 border-b border-slate-200 bg-white/90">
        <h2 className="m-0 text-sm font-semibold tracking-wide">Receiver Inbox</h2>
      </div>
      <div className="flex flex-col gap-2.5 p-3 border-b border-slate-200 bg-white/90">
        <DebouncedInput
          id="receiver-inbox-search"
          value={body.search}
          onChange={(value) => setBody({ ...body, search: value, page: 1 })}
          placeholder="Search patient, DOB, referral ID…"
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-[13px] text-rcn-text"
          aria-label="Search inbox"
        />
        <div className="flex gap-2 flex-wrap" aria-label="Status filters">
          {["all", "pending", "accepted", "rejected"].map((f) => (
            <button
              key={f as ReceiverInboxType}
              type="button"
              onClick={() => setBody({ ...body, type: f as ReceiverInboxType })}
              className={`inline-flex  items-center gap-1.5 px-2.5 py-2 rounded-full border cursor-pointer text-xs font-semibold select-none ${body.type === f ? "bg-rcn-brand/10 border-rcn-brand/20 text-rcn-accent-dark" : "border-slate-200 bg-white text-rcn-muted"}`}
            >
              {f === "all" ? "All" : f === "paid" ? "Paid/Unlocked" : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap" aria-label="Date filters">
          {[[30, "Last 30 days"], [7, "Last 7 days"], [90, "Last 90 days"], [3650, "All time"]].map(([days, label]) => (
            <button
              key={String(days)}
              type="button"
              onClick={() => setBody({ ...body, day: Number(days) })}
              className={`inline-flex items-center gap-1.5 px-2.5 py-2 rounded-full border cursor-pointer text-xs font-semibold select-none ${body.day === Number(days) ? "bg-rcn-brand/10 border-rcn-brand/20 text-rcn-accent-dark" : "border-slate-200 bg-white text-rcn-muted"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-auto max-w-full">
        <TableLayout<ReceivedReferralApi>
          columns={columns}
          data={receiverBodyList}
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
  );
}
