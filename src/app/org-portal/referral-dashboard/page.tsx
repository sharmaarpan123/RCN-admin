"use client";

import { Button, Modal, TableLayout } from "@/components";
import { useState, useMemo } from "react";
import type { TableColumn } from "@/components";
import { toastSuccess } from "@/utils/toast";
import { MOCK_ORG, MOCK_REFERRALS_SENT, MOCK_REFERRALS_RECEIVED, uid, type Referral } from "../mockData";

type InboxRefMode = "sent" | "received";

function fmtDate(iso: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return "—";
  }
}

export default function OrgPortalReferralDashboardPage() {
  const [org] = useState(MOCK_ORG);
  const [referralsSent, setReferralsSent] = useState<Referral[]>(MOCK_REFERRALS_SENT);
  const [referralsReceived, setReferralsReceived] = useState<Referral[]>(MOCK_REFERRALS_RECEIVED);
  const [inboxRefMode, setInboxRefMode] = useState<InboxRefMode>("received");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modal, setModal] = useState<{ mode: InboxRefMode; r: Referral } | null>(null);

  const seedReferrals = () => {
    const today = new Date();
    const d = (daysAgo: number) => {
      const x = new Date(today);
      x.setDate(x.getDate() - daysAgo);
      return x.toISOString();
    };
    const sent: Referral[] = [
      { id: uid("r"), patient: "Judy Leonard", dob: "09/16/1944", service: "Hospice Eval", receiverOrg: "North Suburbs Branch — Clinical Review", status: "Pending", date: d(0) },
      { id: uid("r"), patient: "Irene Felton", dob: "05/02/1945", service: "Home Health", receiverOrg: "Chicago Branch — Intake / Referrals", status: "Accepted", date: d(2) },
      { id: uid("r"), patient: "John Doe", dob: "01/11/1959", service: "Wound Care", receiverOrg: "Chicago Branch — Medical Records", status: "Completed", date: d(7) },
    ];
    const received: Referral[] = [
      { id: uid("r"), patient: "Cassidy Lancaster", dob: "08/03/1980", service: "Neurology Consult", senderOrg: "West Suburbs Clinic", status: "Pending", date: d(1) },
      { id: uid("r"), patient: "Eric Lancaster", dob: "04/14/1974", service: "Internal Medicine", senderOrg: "Urgent Care — Elmhurst", status: "Rejected", date: d(3) },
      { id: uid("r"), patient: "Aisha Patel", dob: "02/05/1970", service: "Pulmonology", senderOrg: "North Suburbs Branch — Scheduling", status: "Paid/Unlocked", date: d(5) },
    ];
    setReferralsSent(sent);
    setReferralsReceived(received);
    toastSuccess("Demo referrals added.");
  };

  const setReferralStatus = (mode: InboxRefMode, id: string, status: string) => {
    if (mode === "received") {
      setReferralsReceived((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    } else {
      setReferralsSent((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    }
    toastSuccess(`Status set to ${status}.`);
  };

  const arr = inboxRefMode === "received" ? referralsReceived : referralsSent;
  const filtered = arr.filter((r) => {
    const hay = [r.patient, r.service, r.status, r.senderOrg, r.receiverOrg, r.id].filter(Boolean).join(" ").toLowerCase();
    const okQ = !search.trim() || hay.includes(search.trim().toLowerCase());
    const okS = !statusFilter || r.status === statusFilter;
    return okQ && okS;
  });

  const columns: TableColumn<Referral>[] = useMemo(
    () =>
      inboxRefMode === "received"
        ? [
            { head: "Date", component: (r) => fmtDate(r.date) },
            { head: "Patient", accessor: "patient" },
            { head: "DOB", accessor: "dob" },
            { head: "Service", accessor: "service" },
            { head: "Sender", accessor: "senderOrg" },
            { head: "Status", accessor: "status" },
          ]
        : [
            { head: "Date", component: (r) => fmtDate(r.date) },
            { head: "Patient", accessor: "patient" },
            { head: "DOB", accessor: "dob" },
            { head: "Service", accessor: "service" },
            { head: "Receiver", accessor: "receiverOrg" },
            { head: "Status", accessor: "status" },
          ],
    [inboxRefMode]
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center justify-between gap-4 mb-4">
        <div className="min-w-0">
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
              className={`flex-1 min-w-0 sm:flex-initial px-3 py-2 rounded-xl border text-sm font-bold transition-all ${inboxRefMode === "sent" ? "border-rcn-accent/60 bg-rcn-accent/10 text-rcn-accent" : "border-rcn-border bg-white hover:border-rcn-accent/40"}`}
            >
              Sender Inbox <small className="text-rcn-muted font-semibold">Referrals Sent</small>
            </button>
            <button
              type="button"
              onClick={() => setInboxRefMode("received")}
              className={`flex-1 min-w-0 sm:flex-initial px-3 py-2 rounded-xl border text-sm font-bold transition-all ${inboxRefMode === "received" ? "border-rcn-accent/60 bg-rcn-accent/10 text-rcn-accent" : "border-rcn-border bg-white hover:border-rcn-accent/40"}`}
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
          <div className="overflow-x-auto rounded-2xl border border-rcn-border">
            <TableLayout<Referral>
              columns={columns}
              data={filtered}
              emptyMessage='No referrals found.'
              wrapperClassName="min-w-[520px]"
              getRowKey={(r) => r.id}
              onRowClick={(r) => setModal({ mode: inboxRefMode, r })}
            />
          </div>
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
