import type { ReferralByIdApi } from "@/app/staff-portal/inbox/types";
import type { ReceiverInstance } from "@/app/staff-portal/inbox/types";

export const BOX_GRAD = "linear-gradient(90deg, rgba(15,107,58,.18), rgba(31,138,76,.12), rgba(31,138,76,.06))";

/** Payment summary response from POST /api/organization/referral/:id/payment-summary. */
export interface PaymentSummaryData {
  referral_id?: string;
  total_departments?: number;
  total_guest_organizations?: number;
  total_recipients?: number;
  source?: string;
  amount?: number;
  currency?: string | null;
  breakdown?: {
    message?: string;
    calculation?: string;
    price_per_referral?: number;
    processing_fee_per_referral?: number;
    processing_fee_percent?: number;
    total_per_referral?: number;
    payment_method_name?: string;
    [key: string]: unknown;
  };
}

/** Flatten API documents object into list of { label, url } for display. Use as-is. */
export function documentsToList(documents: Record<string, unknown> | undefined): { label: string; url: string }[] {
  if (!documents || typeof documents !== "object") return [];
  const out: { label: string; url: string }[] = [];
  const entries: [string, string][] = [
    ["Face Sheet", "face_sheet"],
    ["Medication List", "medication_list"],
    ["Discharge Summary", "discharge_summary"],
    ["Signed Order", "signed_order"],
    ["History & Physical", "history_or_physical"],
    ["Progress Notes", "progress_notes"],
  ];
  for (const [label, key] of entries) {
    const v = documents[key];
    if (typeof v === "string" && v) out.push({ label, url: v });
    if (Array.isArray(v) && v.length) for (let i = 0; i < v.length; i++) out.push({ label: `${label} ${i + 1}`, url: typeof v[i] === "string" ? v[i] : "" });
  }
  const wound = documents.wound_photos;
  if (Array.isArray(wound)) for (let i = 0; i < wound.length; i++) out.push({ label: `Wound Photo ${i + 1}`, url: typeof wound[i] === "string" ? wound[i] : "" });
  else if (typeof wound === "string" && wound) out.push({ label: "Wound Photo", url: wound });
  const other = documents.other_documents;
  if (Array.isArray(other)) for (let i = 0; i < other.length; i++) out.push({ label: `Other Document ${i + 1}`, url: typeof other[i] === "string" ? other[i] : "" });
  else if (typeof other === "string" && other) out.push({ label: "Other Document", url: other });
  return out;
}

/** Department status item from API (GET /api/organization/referral/:id). */
export interface DepartmentStatusApi {
  department_id: string;
  department: { _id?: string; name?: string };
  status?: string;
  payment_status?: string;
  organization_name?: string;
  name?: string;
  updated_at?: string;
  paid_by_user_id?: string | null;
  department_user_id?: string | null;
  /** 1 = sender already paid for this department; receiver can only Accept or Reject. */
  is_paid_by_sender?: number;
}

/** Build a map of department _id -> name from department_ids when populated (array of objects). */
function departmentNamesFromIds(data: ReferralByIdApi): Map<string, string> {
  const map = new Map<string, string>();
  const ids = data.department_ids ?? [];
  for (const item of ids) {
    if (item && typeof item === "object" && "name" in item && typeof (item as { name?: string }).name === "string") {
      const id = (item as { _id?: string })._id;
      if (id) map.set(id, (item as { name: string }).name);
    }
  }
  return map;
}

/** Build receivers list from API department_statuses + _localReceivers (as-is). Normalizes status to uppercase; paidUnlocked from payment_status === "paid". Uses department_ids[].name when populated. Adds rows from department_ids when populated so received department names show even before status. */
export function receiversFromData(data: ReferralByIdApi): ReceiverInstance[] {
  const deptNames = departmentNamesFromIds(data);
  const dept = (data.department_statuses ?? []) as DepartmentStatusApi[];
  const fromApi = dept.map((d, i) => {
    const departmentId = d.department_id ?? d.department?._id ?? `dept-${i}`;
    const name =
      deptNames.get(departmentId) ??
      d.department?.name ??
      d.organization_name ??
      (d as { name?: string }).name ??
      "Receiver";
    return {
      receiverId: departmentId,
      name,
      email: "",
      status: (d.status ?? "PENDING").toString().toUpperCase(),
      paidUnlocked: d.payment_status === "paid",
      updatedAt: d.updated_at ? new Date(d.updated_at) : new Date(),
      rejectReason: "",
      departmentId: departmentId,
    };
  });
  const fromApiIds = new Set(fromApi.map((r) => r.receiverId));
  const fromDeptIds = (data.department_ids ?? [])
    .filter((item): item is { _id: string; name: string } => typeof item === "object" && item !== null && typeof (item as { _id?: string })._id === "string")
    .filter((item) => !fromApiIds.has(item._id))
    .map((item) => ({
      receiverId: item._id,
      name: typeof item.name === "string" && item.name ? item.name : "Receiver",
      email: "",
      status: "PENDING",
      paidUnlocked: false,
      updatedAt: new Date(),
      rejectReason: "",
      departmentId: item._id,
    }));
  return [...fromApi, ...fromDeptIds, ...(data._localReceivers ?? [])];
}

/** Get department status for a given department id from referral data. */
export function getDepartmentStatusByDepartmentId(
  data: ReferralByIdApi,
  departmentId: string | null
): DepartmentStatusApi | undefined {
  const list = (data.department_statuses ?? []) as DepartmentStatusApi[];
  return departmentId ? list.find((d) => (d.department_id ?? d.department?._id) === departmentId) : undefined;
}

export type DocRow = { label: string; url: string; kind: "api" | "local"; localIndex?: number };
