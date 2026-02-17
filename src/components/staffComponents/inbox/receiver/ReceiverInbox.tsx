"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import type { ReceivedReferralApi, ReferralListMeta } from "@/app/staff-portal/inbox/types";
import { fmtDate, pillClass, pillLabel } from "@/app/staff-portal/inbox/helpers";
import { ReceiverInboxBody } from "@/app/staff-portal/inbox/page";
import { Button, DebouncedInput, TableLayout, type TableColumn } from "@/components";
import CustomPagination from "@/components/CustomPagination";

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
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  dateFilterDays: number;
  setDateFilterDays: (d: number) => void;
  meta: ReferralListMeta;
  isLoading?: boolean;
}

export function ReceiverInbox({
  referrals,
  body,
  setBody,
  statusFilter,
  setStatusFilter,
  dateFilterDays,
  setDateFilterDays,
  meta,
  isLoading = false,
}: ReceiverInboxProps) {
  const router = useRouter();

  const baseList = useMemo(() => {
    const now = new Date();
    const cutoff = new Date(now.getTime() - dateFilterDays * 24 * 60 * 60 * 1000);
    return referrals
      .filter((ref) => {
        if (statusFilter !== "ALL") {
          const s = receivedReferralStatus(ref);
          if (statusFilter === "ACCEPTED") return ["ACCEPTED", "PAID", "COMPLETED"].includes(s);
          if (s !== statusFilter) return false;
        }
        const date = ref.sent_at ? new Date(ref.sent_at) : new Date(ref.createdAt ?? 0);
        if (date < cutoff) return false;
        return true;
      })
      .sort((a, b) => {
        const da = a.sent_at ? new Date(a.sent_at).getTime() : new Date(a.createdAt ?? 0).getTime();
        const db = b.sent_at ? new Date(b.sent_at).getTime() : new Date(b.createdAt ?? 0).getTime();
        return db - da;
      });
  }, [referrals, statusFilter, dateFilterDays]);

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
      { head: "Referral ID", component: (ref) => <span className="font-black text-[13px]">{ref._id}</span> },
      {
        head: "Patient",
        component: (ref) => {
          const p = ref.patient;
          const last = p?.patient_last_name ?? "";
          const first = p?.patient_first_name ?? "";
          const dob = p?.dob ?? "";
          return <span className="font-[850] text-[13px]">{last}, {first} • DOB {dob}</span>;
        },
      },
      {
        head: "Services",
        component: (ref) => {
          const ids = ref.speciality_ids ?? [];
          const extra = ref.additional_speciality ?? [];
          const label = ids.length > 0 ? `${ids.length} service(s)` : extra.length > 0 ? (extra[0] as { name?: string })?.name ?? "—" : "—";
          return <span className="text-rcn-muted text-xs font-[850]">{label}</span>;
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
          return <span className="text-rcn-muted text-xs font-[850]">{d ? fmtDate(d) : "—"}</span>;
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
        <p className="m-0 mt-1 text-rcn-muted text-xs font-[850]">Referrals sent to your organization. Search, filter, and click to view details.</p>
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
          {["ALL", "PENDING", "ACCEPTED", "REJECTED", "PAID", "COMPLETED"].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setStatusFilter(f)}
              className={`inline-flex  items-center gap-1.5 px-2.5 py-2 rounded-full border cursor-pointer text-xs font-extrabold select-none ${statusFilter === f ? "bg-rcn-brand/10 border-rcn-brand/20 text-rcn-accent-dark" : "border-slate-200 bg-white text-rcn-muted"}`}
            >
              {f === "ALL" ? "All" : f === "PAID" ? "Paid/Unlocked" : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap" aria-label="Date filters">
          {[[30, "Last 30 days"], [7, "Last 7 days"], [90, "Last 90 days"], [3650, "All time"]].map(([days, label]) => (
            <button
              key={String(days)}
              type="button"
              onClick={() => setDateFilterDays(Number(days))}
              className={`inline-flex items-center gap-1.5 px-2.5 py-2 rounded-full border cursor-pointer text-xs font-extrabold select-none ${dateFilterDays === days ? "bg-rcn-brand/10 border-rcn-brand/20 text-rcn-accent-dark" : "border-slate-200 bg-white text-rcn-muted"}`}
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
          onRowClick={(ref) => router.push(`/staff-portal/inbox/receiver/${ref._id}`)}
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
