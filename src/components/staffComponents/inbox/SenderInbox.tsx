"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { SentReferralApi, Company } from "@/app/staff-portal/inbox/types";
import { fmtDate, pillClass, pillLabel } from "@/app/staff-portal/inbox/helpers";
import { ForwardModal } from "../ForwardModal";
import { Button, DebouncedInput, TableLayout, type TableColumn } from "@/components";

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
  setReferrals: React.Dispatch<React.SetStateAction<SentReferralApi[]>>;
  companyDirectory: Company[];
  setCompanyDirectory: React.Dispatch<React.SetStateAction<Company[]>>;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  dateFilterDays: number;
  setDateFilterDays: (d: number) => void;
  query: string;
  setQuery: (q: string) => void;
  isLoading?: boolean;
}

export function SenderInbox({
  referrals,
  setReferrals,
  companyDirectory,
  setCompanyDirectory,
  statusFilter,
  setStatusFilter,
  dateFilterDays,
  setDateFilterDays,
  query,
  setQuery,
  isLoading = false,
}: SenderInboxProps) {
  const router = useRouter();
  const [forwardOpen, setForwardOpen] = useState(false);
  const [forwardRefId, setForwardRefId] = useState<string | null>(null);
  const [forwardSelectedCompany, setForwardSelectedCompany] = useState<Company | null>(null);

  const baseList = useMemo(() => {
    const now = new Date();
    const cutoff = new Date(now.getTime() - dateFilterDays * 24 * 60 * 60 * 1000);
    return referrals
      .filter((ref) => {
        if (statusFilter !== "ALL") {
          const s = sentReferralStatus(ref);
          if (statusFilter === "DRAFT" && ref.is_draft) return true;
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

  const senderBodyList = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return baseList;
    return baseList.filter((ref) => {
      const p = ref.patient;
      const patient = `${p?.patient_last_name ?? ""} ${p?.patient_first_name ?? ""} ${p?.dob ?? ""}`.toLowerCase();
      const localNames = (ref._localReceivers ?? []).map((x) => x.name.toLowerCase()).join(" ");
      return `${ref._id} ${patient} ${localNames}`.includes(q);
    });
  }, [baseList, query]);

  const fullRef = forwardRefId ? referrals.find((r) => r._id === forwardRefId) : null;

  const openForward = useCallback((id: string) => {
    setForwardRefId(id);
    setForwardSelectedCompany(null);
    setForwardOpen(true);
  }, []);

  const forwardReferral = useCallback(
    (refId: string, company: Company, customServices: string[] | null) => {
      const rxId = "RX-FWD-" + Math.random().toString(16).slice(2, 8).toUpperCase();
      setReferrals((prev) =>
        prev.map((r) => {
          if (r._id !== refId) return r;
          const newReceiver = { receiverId: rxId, name: company.name.trim(), email: (company.email || "").trim(), status: "PENDING", paidUnlocked: false, updatedAt: new Date(), rejectReason: "", servicesRequestedOverride: customServices || null };
          return { ...r, _localReceivers: [...(r._localReceivers ?? []), newReceiver] };
        })
      );
      setForwardOpen(false);
    },
    [setReferrals]
  );

  const addCompanyAndSelect = useCallback(
    (name: string, email: string) => {
      const n = name.trim();
      if (!n) return;
      if (!companyDirectory.some((c) => c.name.toLowerCase() === n.toLowerCase())) setCompanyDirectory((prev) => [{ name: n, email: email.trim() }, ...prev]);
      setForwardSelectedCompany({ name: n, email: email.trim() });
    },
    [companyDirectory, setCompanyDirectory]
  );

  const columns: TableColumn<SentReferralApi>[] = useMemo(
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
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-black border ${pillClass(st)}`}>
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
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => router.push(`/staff-portal/inbox/sender/${ref._id}`)}
              className="border border-rcn-brand/25 bg-rcn-brand/10 text-rcn-accent-dark px-2 py-1.5 rounded-xl font-extrabold text-xs shadow mr-1"
            >
              View
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => openForward(ref._id)}
            >
              Forward
            </Button>
          </div>
        ),
      },
    ],
    [router, openForward]
  );

  return (
    <>
      <section className="mt-3.5 border border-slate-200 bg-white/65 rounded-2xl shadow-[0_10px_30px_rgba(2,6,23,.07)] overflow-hidden" aria-label="Sender inbox list">
        <div className="p-3.5 pt-3 pb-2.5 border-b border-slate-200 bg-white/90">
          <h2 className="m-0 text-sm font-semibold tracking-wide">Sender Inbox</h2>
          <p className="m-0 mt-1 text-rcn-muted text-xs font-[850]">Search, filter, and click a referral to view details.</p>
        </div>
        <div className="flex flex-col gap-2.5 p-3 border-b border-slate-200 bg-white/90">
          <DebouncedInput
            id="sender-inbox-search"
            value={query}
            onChange={setQuery}
            placeholder="Search patient, DOB, receiver, referral ID…"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-[13px] text-rcn-text"
            aria-label="Search inbox"
          />
          <div className="flex gap-2 flex-wrap" aria-label="Status filters">
            {["ALL", "DRAFT", "SENT", "PENDING", "ACCEPTED", "REJECTED", "PAID", "COMPLETED"].map((f) => (
              <button key={f} type="button" onClick={() => setStatusFilter(f)} className={`inline-flex items-center gap-1.5 px-2.5 py-2 rounded-full border cursor-pointer text-xs font-extrabold select-none ${statusFilter === f ? "bg-rcn-brand/10 border-rcn-brand/20 text-rcn-accent-dark" : "border-slate-200 bg-white text-rcn-muted"}`}>
                {f === "ALL" ? "All" : f === "PAID" ? "Paid/Unlocked" : f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap" aria-label="Date filters">
            {[[30, "Last 30 days"], [7, "Last 7 days"], [90, "Last 90 days"], [3650, "All time"]].map(([days, label]) => (
              <button key={String(days)} type="button" onClick={() => setDateFilterDays(Number(days))} className={`inline-flex items-center gap-1.5 px-2.5 py-2 rounded-full border cursor-pointer text-xs font-extrabold select-none ${dateFilterDays === days ? "bg-rcn-brand/10 border-rcn-brand/20 text-rcn-accent-dark" : "border-slate-200 bg-white text-rcn-muted"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-auto max-w-full">
          {isLoading ? (
            <div className="py-5 px-3.5 text-center text-rcn-muted font-extrabold text-[13px]">Loading sent referrals…</div>
          ) : senderBodyList.length === 0 ? (
            <div className="py-5 px-3.5 text-center text-rcn-muted font-extrabold text-[13px]">No referrals match your filters.</div>
          ) : (
            <TableLayout<SentReferralApi>
              columns={columns}
              data={senderBodyList}
              size="sm"
              tableClassName="[&_thead_tr]:bg-rcn-brand/10 [&_th]:border-slate-200 [&_th]:border-b [&_td]:border-slate-200 [&_td]:border-b [&_tr]:border-slate-200 [&_tr:hover]:bg-slate-50/50"
              getRowKey={(ref) => ref._id}
              onRowClick={(ref) => router.push(`/staff-portal/inbox/sender/${ref._id}`)}
            />
          )}
        </div>
      </section>

      <ForwardModal
        isOpen={forwardOpen}
        onClose={() => { setForwardOpen(false); setForwardRefId(null); setForwardSelectedCompany(null); }}
        refId={forwardRefId}
        servicesRequested={fullRef?.speciality_ids ?? []}
        companyDirectory={companyDirectory}
        selectedCompany={forwardSelectedCompany}
        onSelectCompany={setForwardSelectedCompany}
        onForward={(company: Company, customServices: string[] | null) => forwardRefId && forwardReferral(forwardRefId, company, customServices)}
        onAddCompanyAndSelect={addCompanyAndSelect}
      />
    </>
  );
}
