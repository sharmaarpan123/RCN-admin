import type { Referral } from "./types";

export function fmtDate(d: Date) {
  return new Date(d).toLocaleString(undefined, { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export function pillClass(status: string): string {
  const m: Record<string, string> = {
    PENDING: "border-amber-300 bg-amber-100 text-amber-800",
    ACCEPTED: "border-rcn-brand/30 bg-rcn-brand/10 text-rcn-accent-dark",
    REJECTED: "border-red-300 bg-red-100 text-red-800",
    PAID: "border-blue-300 bg-blue-100 text-blue-800",
    COMPLETED: "border-slate-300 bg-slate-100 text-slate-600",
  };
  return m[status] || "border-slate-300 bg-slate-100 text-slate-600";
}

export function pillLabel(status: string): string {
  const m: Record<string, string> = {
    PENDING: "Pending",
    ACCEPTED: "Accepted",
    REJECTED: "Rejected",
    PAID: "Paid/Unlocked",
    COMPLETED: "Completed",
  };
  return m[status] || status;
}

export function overallStatus(ref: Referral): string {
  const st = ref.receivers.map((r) => r.status);
  if (st.every((x) => x === "COMPLETED")) return "COMPLETED";
  if (st.some((x) => x === "PAID")) return "PAID";
  if (st.every((x) => x === "REJECTED")) return "REJECTED";
  if (st.every((x) => x === "ACCEPTED")) return "ACCEPTED";
  if (st.some((x) => x === "PENDING")) return "PENDING";
  if (st.some((x) => x === "ACCEPTED")) return "ACCEPTED";
  return "PENDING";
}

export function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}
