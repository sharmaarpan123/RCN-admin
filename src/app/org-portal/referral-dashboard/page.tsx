"use client";

import {
  useOrgPortal,
  type Referral,
  type InboxRefMode,
} from "@/context/OrgPortalContext";
import { Button, Modal } from "@/components";
import { useState } from "react";

function fmtDate(iso: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return "—";
  }
}

export default function OrgPortalReferralDashboardPage() {
  const {
    org,
    referralsSent,
    referralsReceived,
    seedReferrals,
    setReferralStatus,
    inboxRefMode,
    setInboxRefMode,
  } = useOrgPortal();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modal, setModal] = useState<{ mode: InboxRefMode; r: Referral } | null>(null);

  const arr = inboxRefMode === "received" ? referralsReceived : referralsSent;
  const filtered = arr.filter((r) => {
    const hay = [r.patient, r.service, r.status, r.senderOrg, r.receiverOrg, r.id].filter(Boolean).join(" ").toLowerCase();
    const okQ = !search.trim() || hay.includes(search.trim().toLowerCase());
    const okS = !statusFilter || r.status === statusFilter;
    return okQ && okS;
  });

  const cols =
    inboxRefMode === "received"
      ? [
          { k: "date" as const, t: "Date" },
          { k: "patient" as const, t: "Patient" },
          { k: "dob" as const, t: "DOB" },
          { k: "service" as const, t: "Service" },
          { k: "senderOrg" as const, t: "Sender" },
          { k: "status" as const, t: "Status" },
        ]
      : [
          { k: "date" as const, t: "Date" },
          { k: "patient" as const, t: "Patient" },
          { k: "dob" as const, t: "DOB" },
          { k: "service" as const, t: "Service" },
          { k: "receiverOrg" as const, t: "Receiver" },
          { k: "status" as const, t: "Status" },
        ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-xl font-bold m-0">Referral Dashboard</h1>
          <p className="text-sm text-rcn-muted m-0 mt-0.5">View organization-wide Sender and Receiver inboxes.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold px-2 py-1 rounded-full border border-rcn-accent/40 text-rcn-accent bg-rcn-accent/10">Sent: {referralsSent.length}</span>
          <span className="text-xs font-bold px-2 py-1 rounded-full border border-rcn-accent/40 text-rcn-accent bg-rcn-accent/10">Received: {referralsReceived.length}</span>
          <Button variant="primary" size="sm" onClick={seedReferrals}>Load Demo Referrals</Button>
        </div>
      </div>

      <div className="bg-rcn-card border border-rcn-border rounded-2xl shadow-rcn overflow-hidden">
        <div className="p-4 space-y-3">
          <div className="rounded-xl border border-dashed border-rcn-accent/50 bg-rcn-accent/5 px-3 py-2 text-xs">
            This is a <b>demo inbox</b> for the entire organization. In production, connect to your backend referral service and permission rules.
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setInboxRefMode("sent")}
              className={`px-3 py-2 rounded-xl border text-sm font-bold transition-all ${inboxRefMode === "sent" ? "border-rcn-accent/60 bg-rcn-accent/10 text-rcn-accent" : "border-rcn-border bg-white hover:border-rcn-accent/40"}`}
            >
              Sender Inbox <small className="text-rcn-muted font-semibold">Referrals Sent</small>
            </button>
            <button
              type="button"
              onClick={() => setInboxRefMode("received")}
              className={`px-3 py-2 rounded-xl border text-sm font-bold transition-all ${inboxRefMode === "received" ? "border-rcn-accent/60 bg-rcn-accent/10 text-rcn-accent" : "border-rcn-border bg-white hover:border-rcn-accent/40"}`}
            >
              Receiver Inbox <small className="text-rcn-muted font-semibold">Referrals Received</small>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-rcn-muted mb-1.5">Search</label>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search patient / organization / service..." className="w-full px-2.5 py-2 text-sm rounded-xl border border-rcn-border bg-white focus:outline-none focus:ring-2 focus:ring-rcn-accent/30" />
            </div>
            <div>
              <label className="block text-xs text-rcn-muted mb-1.5">Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-2.5 py-2 text-sm rounded-xl border border-rcn-border bg-white focus:outline-none focus:ring-2 focus:ring-rcn-accent/30">
                <option value="">All</option>
                <option value="Pending">Pending</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
                <option value="Paid/Unlocked">Paid/Unlocked</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button variant="secondary" size="sm" onClick={() => { setSearch(""); setStatusFilter(""); }}>Clear Filters</Button>
            </div>
          </div>
          <div className="overflow-auto rounded-2xl border border-rcn-border">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-rcn-bg/90">
                  {cols.map((c) => (
                    <th key={c.k} className="px-3 py-2.5 text-left text-xs uppercase tracking-wide text-rcn-muted font-semibold">{c.t}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!filtered.length && (
                  <tr>
                    <td colSpan={cols.length} className="px-3 py-4 text-rcn-muted text-xs">No referrals found. Use &quot;Load Demo Referrals&quot; to add demo data.</td>
                  </tr>
                )}
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t border-rcn-border/60 hover:bg-rcn-accent/5 cursor-pointer"
                    onClick={() => setModal({ mode: inboxRefMode, r })}
                  >
                    {cols.map((c) => (
                      <td key={c.k} className="px-3 py-2.5">
                        {c.k === "date" ? fmtDate(r.date) : (r[c.k] ?? "—")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-rcn-muted m-0">Tip: Click any row to open details.</p>
        </div>
      </div>

      {modal && (
        <Modal isOpen={!!modal} onClose={() => setModal(null)} maxWidth="560px">
          <div className="p-4">
            <h3 className="font-bold m-0">{modal.mode === "received" ? "Receiver Inbox — Referral" : "Sender Inbox — Referral"}</h3>
            <p className="text-xs text-rcn-muted m-0 mt-1">{modal.r.patient || "Patient"} • {fmtDate(modal.r.date)} • {modal.r.status || "—"}</p>
            <div className="mt-4 space-y-3">
              <div><span className="text-xs text-rcn-muted">Patient:</span> <span className="font-semibold">{modal.r.patient || "—"} (DOB: {modal.r.dob || "—"})</span></div>
              <div><span className="text-xs text-rcn-muted">Status:</span> {modal.r.status || "—"}</div>
              <div><span className="text-xs text-rcn-muted">Service:</span> {modal.r.service || "—"}</div>
              <div><span className="text-xs text-rcn-muted">Referral ID:</span> <span className="font-mono text-xs">{modal.r.id || "—"}</span></div>
              <div><span className="text-xs text-rcn-muted">Sender:</span> {modal.mode === "received" ? (modal.r.senderOrg || "—") : (org?.name || "—")}</div>
              <div><span className="text-xs text-rcn-muted">Receiver:</span> {modal.mode === "received" ? (org?.name || "—") : (modal.r.receiverOrg || "—")}</div>
            </div>
            <div className="flex gap-2 flex-wrap mt-4">
              {["Pending", "Accepted", "Rejected", "Completed"].map((s) => (
                <Button key={s} variant="secondary" size="sm" onClick={() => { setReferralStatus(modal.mode, modal.r.id, s); setModal({ ...modal, r: { ...modal.r, status: s } }); }}>{s}</Button>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
