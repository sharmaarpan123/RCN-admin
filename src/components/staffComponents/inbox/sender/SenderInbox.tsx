"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { SentReferralApi, Company, ReferralListMeta } from "@/app/staff-portal/inbox/types";
import { fmtDate, pillClass, pillLabel } from "@/app/staff-portal/inbox/helpers";
import { ForwardModal } from "../../ForwardModal";
import { Button, DebouncedInput, TableLayout, type TableColumn } from "@/components";
import CustomPagination from "@/components/CustomPagination";
import { SenderInboxBody, SenderInboxType } from "@/app/staff-portal/inbox/page";
import moment from "moment";


function sentReferralStatus(ref: SentReferralApi): string {
  if (ref.is_draft) return "DRAFT";
  const statuses = ref.department_statuses as { status?: string }[] | undefined;
  if (Array.isArray(statuses) && statuses.length > 0) {
    const first = statuses[0]?.status;
    if (first) return first;
  }
  return "SENT";
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
  
  const baseList = referrals


  




  const columns: TableColumn<SentReferralApi>[] = useMemo(
    () => [
      { head: "Referral ID", component: (ref) => <span className="font-black text-[13px]">{ref._id}</span> },
      {
        head: "Patient",
        component: (ref) => {
          const p = ref.patient;
          const last = p?.patient_last_name ?? "";
          const first = p?.patient_first_name ?? "";
          const name = `${last} ${first}`.trim() || "N/A";
          const dob = p?.dob ?? "";
          return <span className="font-[850] text-[13px]">{name} {dob ? `• DOB ${dob || "N/A"}` : ""}</span>;
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
        head: "Receivers",
        component: (ref) => {
          const local = ref._localReceivers ?? [];
          const dept = ref.department_statuses ?? [];
          const n = local.length || (Array.isArray(dept) ? dept.length : 0);
          const name = local[0]?.name;
          const label = n > 1 ? `${n} receivers` : name ?? (n ? "1 receiver" : "—");
          return <span className="text-rcn-muted text-xs font-[850]">{label}</span>;
        },
      },
      {
        head: "Status",
        component: (ref) => {
          const st = sentReferralStatus(ref);
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
          return <span className="text-rcn-muted text-xs font-[850]">{d ? moment(d).format("MMM D, YYYY , hh:mm a") : "—"}</span>;
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
              onClick={() => router.push(`/staff-portal/inbox/sender/${ref._id}`)}
              className="border border-rcn-brand/25  text-rcn-accent-dark px-2 py-1.5 rounded-xl font-extrabold text-xs shadow mr-1"
            >
              View
            </Button>
            {/* <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => openForward(ref._id)}
            >
              Forward
            </Button> */}
          </div>
        ),
      },
    ],
    [router]
  );

  return (
    <>
      <section className="mt-3.5 border border-slate-200 bg-white/65 rounded-2xl shadow-[0_10px_30px_rgba(2,6,23,.07)] overflow-hidden" aria-label="Sender inbox list">
        <div className="p-3.5 pt-3 pb-2.5 border-b border-slate-200 bg-white/90">
          <h2 className="m-0 text-sm font-semibold tracking-wide">Sender Inbox</h2>
        </div>
        <div className="flex flex-col gap-2.5 p-3 border-b border-slate-200 bg-white/90">
          <DebouncedInput
            id="sender-inbox-search"
            value={body.search}
            onChange={(value) => setBody({ ...body, search: value })}
            placeholder="Search patient, DOB, receiver, referral ID…"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-[13px] text-rcn-text"
            aria-label="Search inbox"
          />
          <div className="flex gap-2 flex-wrap" aria-label="Status filters">
            {[{ label: "ALL", value: "all" as SenderInboxType }, { label: "DRAFT", value: "draft" as SenderInboxType }, { label: "SENT", value: "sent" as SenderInboxType }].map((f) => (
              <button key={f.value} type="button" onClick={() => setBody({ ...body, type: f.value as SenderInboxType })} className={`inline-flex items-center gap-1.5 px-2.5 py-2 rounded-full border cursor-pointer text-xs font-extrabold select-none ${body.type === f.value ? "bg-rcn-brand/10 border-rcn-brand/20 text-rcn-accent-dark" : "border-slate-200 bg-white text-rcn-muted"}`}>
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap" aria-label="Date filters">
            {[[30, "Last 30 days"], [7, "Last 7 days"], [90, "Last 90 days"], [0, "All time"]].map(([days, label]) => (
              <button key={String(days)} type="button" onClick={() => setBody(p => ({ ...p, day: Number(days) }))} className={`inline-flex items-center gap-1.5 px-2.5 py-2 rounded-full border cursor-pointer text-xs font-extrabold select-none ${body.day === Number(days) ? "bg-rcn-brand/10 border-rcn-brand/20 text-rcn-accent-dark" : "border-slate-200 bg-white text-rcn-muted"}`}>
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

      {/* <ForwardModal
        isOpen={forwardOpen}
        onClose={() => { setForwardOpen(false); setForwardRefId(null); setForwardSelectedCompany(null); }}
        refId={forwardRefId}
        servicesRequested={fullRef?.speciality_ids ?? []}
        companyDirectory={companyDirectory}
        selectedCompany={forwardSelectedCompany}
        onSelectCompany={setForwardSelectedCompany}
        onForward={(company: Company, customServices: string[] | null) => forwardRefId && forwardReferral(forwardRefId, company, customServices)}
        onAddCompanyAndSelect={addCompanyAndSelect}
      /> */}
    </>
  );
}
