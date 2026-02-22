"use client";

import { Button, Modal, PreviewFile } from "@/components";
import { fmtDate } from "@/utils/database";
import { toastWarning } from "@/utils/toast";
import { useState } from "react";

export type DashboardOrg = {
  id: string;
  name: string;
  address: { state: string; zip: string };
};

/** Flatten API documents object into list of { label, url } for display. */
function documentsToList(documents: Record<string, unknown> | undefined): { label: string; url: string }[] {
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

const BOX_GRAD = "linear-gradient(90deg, rgba(15,107,58,.18), rgba(31,138,76,.12), rgba(31,138,76,.06))";

export interface ReferralViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Referral data (API shape: _id, patient, department_statuses, documents, etc.) */
  refData: Record<string, unknown> | null;
  isReceiver: boolean;
}

export function ReferralViewModal({ isOpen, onClose, refData, isReceiver }: ReferralViewModalProps) {
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);

  if (!refData) return null;

  const refId = (refData._id ?? refData.id) as string;
  const senderName = (refData.facility_name as string) ?? "—";
  const refDate = (refData.sent_at ?? refData.createdAt ?? refData.created_at) as string;
  const deptStatuses = (refData.department_statuses ?? []) as Array<{ status?: string; department?: { name?: string; organization_id?: string }; payment_status?: string }>;
  const guestOrgs = (refData.guest_organization_statuses ?? []) as Array<{ company_name?: string; is_claimed?: boolean }>;
  const hasPending = deptStatuses.some((d) => (d.status ?? "").toLowerCase() === "pending");
  const patient = (refData.patient ?? {}) as Record<string, unknown>;
  const insList = (refData.patient_insurance_information ?? []) as Array<{ payer?: string; policy?: string; plan_group?: string }>;
  const primary = insList[0];
  const addPatient = (refData.additional_patient ?? {}) as Record<string, unknown>;
  const primaryCare = (refData.primary_care ?? {}) as Record<string, unknown>;
  const documents = refData.documents as Record<string, unknown> | undefined;
  const docRows = documentsToList(documents);
  const billing = refData.billing as Record<string, unknown> | undefined;
  const specialityIds = (refData.speciality_ids ?? []) as Array<{ name?: string }>;
  const additionalSpeciality = (refData.additional_speciality ?? []) as Array<{ name?: string }>;
  const servicesLabel = [
    ...specialityIds.map((s) => s.name).filter(Boolean),
    ...additionalSpeciality.map((s) => s.name).filter(Boolean),
  ].join(", ") || "—";

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="900px">
      <div className="p-1">
        <h3 className="m-0 mb-3 text-lg font-semibold">Referral Details</h3>

        {/* Basic: ID, Date, Sender */}
        <div className="border border-rcn-border/60 bg-white/95 rounded-[18px] p-3.5 shadow-sm mb-3.5 overflow-hidden border-l-4 border-l-rcn-brand">
          <div className="-m-3.5 -mt-3.5 mb-3 p-3 border-b border-rcn-border/60 rounded-t-[18px]" style={{ background: BOX_GRAD }}>
            <h4 className="m-0 text-[13px] font-semibold tracking-wide">Basic Information</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] text-rcn-muted font-semibold mb-1">Referral ID</label>
              <div className="text-[13px] font-mono p-2.5 border border-dashed border-slate-300/75 rounded-xl bg-slate-50/55">{refId}</div>
            </div>
            <div>
              <label className="block text-[11px] text-rcn-muted font-semibold mb-1">Date</label>
              <div className="text-[13px] p-2.5 border border-dashed border-slate-300/75 rounded-xl bg-slate-50/55">{fmtDate(refDate)}</div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] text-rcn-muted font-semibold mb-1">Sender</label>
              <div className="text-[13px] p-2.5 border border-dashed border-slate-300/75 rounded-xl bg-slate-50/55">
                {senderName}

              </div>
            </div>
          </div>
        </div>

        {/* Patient */}
        <div className="border border-rcn-border/60 bg-white/95 rounded-[18px] p-3.5 shadow-sm mb-3.5 overflow-hidden border-l-4 border-l-rcn-brand">
          <div className="-m-3.5 -mt-3.5 mb-3 p-3 border-b border-rcn-border/60 rounded-t-[18px]" style={{ background: BOX_GRAD }}>
            <h4 className="m-0 text-[13px] font-semibold tracking-wide">Patient Information</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              ["Last Name", patient.patient_last_name ?? patient.last_name],
              ["First Name", patient.patient_first_name ?? patient.first_name],
              ["Date of Birth (DOB)", patient.dob],
              ["Gender", patient.gender],
              ["Address of Care", patient.address_of_care],
              ["Services Requested", servicesLabel],
              ["Primary Insurance", primary ? `${primary.payer ?? ""} • Policy: ${primary.policy ?? ""}` : "—"],
              ["Additional Insurances", insList.length > 1 ? insList.slice(1).map((x) => `${(x as { payer?: string }).payer ?? ""} • ${(x as { policy?: string }).policy ?? ""}`).join(" | ") : "None"],
            ].map(([label, val]) => (
              <div key={String(label)}>
                <label className="block text-[11px] text-rcn-muted font-semibold mb-1">{String(label)}</label>
                <div className="text-[13px] p-2.5 border border-dashed border-slate-300/75 rounded-xl bg-slate-50/55">{val != null && val !== "" ? String(val) : "—"}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Receivers & Status */}
        <div className="border border-rcn-border/60 bg-white/95 rounded-[18px] p-3.5 shadow-sm mb-3.5 overflow-hidden border-l-4 border-l-rcn-brand">
          <div className="-m-3.5 -mt-3.5 mb-3 p-3 border-b border-rcn-border/60 rounded-t-[18px]" style={{ background: BOX_GRAD }}>
            <h4 className="m-0 text-[13px] font-semibold tracking-wide">Receivers & Status</h4>
          </div>
          <div className="overflow-hidden rounded-[14px] border border-slate-200 bg-white">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr>
                  <th className="text-left p-2.5 bg-rcn-brand/10 text-rcn-text font-semibold text-[11px] uppercase tracking-wide">Receiver</th>
                  <th className="text-left p-2.5 bg-rcn-brand/10 font-semibold text-[11px] uppercase">Status</th>
                  <th className="text-left p-2.5 bg-rcn-brand/10 font-semibold text-[11px] uppercase">Payment</th>
                </tr>
              </thead>
              <tbody>
                {deptStatuses.map((d, i) => {
                  const dept = d.department;
                  const name = dept?.name ?? "—";
                  const status = d.status ?? "pending";
                  return (
                    <tr key={i} className="border-t border-slate-200">
                      <td className="p-2.5 align-top">
                        <strong>{name}</strong>
                      </td>
                      <td className="p-2.5">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border ${getStatusClass(status)}`}>
                          {displayStatus(status)}
                        </span>
                      </td>
                      <td className="p-2.5">{d.payment_status === "paid" ? "Paid" : "—"}</td>
                    </tr>
                  );
                })}
                {guestOrgs.map((g, i) => (
                  <tr key={`guest-${i}`} className="border-t border-slate-200">
                    <td className="p-2.5"><strong>{g.company_name ?? "—"}</strong></td>
                    <td className="p-2.5">{g.is_claimed ? "Claimed" : "Pending"}</td>
                    <td className="p-2.5">—</td>
                  </tr>
                ))}
                {deptStatuses.length === 0 && guestOrgs.length === 0 && (
                  <tr><td colSpan={3} className="p-2.5 text-rcn-muted">No receivers.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Documents */}
        <div className="border border-rcn-border/60 bg-white/95 rounded-[18px] p-3.5 shadow-sm mb-3.5 overflow-hidden border-l-4 border-l-rcn-brand">
          <div className="-m-3.5 -mt-3.5 mb-3 p-3 border-b border-rcn-border/60 rounded-t-[18px]" style={{ background: BOX_GRAD }}>
            <h4 className="m-0 text-[13px] font-semibold tracking-wide">Attached Documents</h4>
          </div>
          <div className="overflow-hidden rounded-[14px] border border-slate-200 bg-white">
            {docRows.length > 0 ? (
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr>
                    <th className="text-left p-2.5 bg-rcn-brand/10 font-semibold text-[11px] uppercase">Document</th>
                    <th className="text-left p-2.5 bg-rcn-brand/10 font-semibold text-[11px] uppercase">View</th>
                  </tr>
                </thead>
                <tbody>
                  {docRows.map((d, idx) => (
                    <tr key={idx} className="border-t border-slate-200">
                      <td className="p-2.5"><strong>{d.label}</strong></td>
                      <td className="p-2.5">
                        {d.url ? (
                          <Button type="button" variant="secondary" size="sm" onClick={() => setPreviewDocUrl(d.url)}>
                            View document
                          </Button>
                        ) : (
                          <span className="text-rcn-muted text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-3 text-rcn-muted text-sm">No documents attached.</div>
            )}
          </div>
        </div>

        {/* Additional Patient */}
        <div className="border border-rcn-border/60 bg-white/95 rounded-[18px] p-3.5 shadow-sm mb-3.5 overflow-hidden border-l-4 border-l-rcn-brand">
          <div className="-m-3.5 -mt-3.5 mb-3 p-3 border-b border-rcn-border/60 rounded-t-[18px]" style={{ background: BOX_GRAD }}>
            <h4 className="m-0 text-[13px] font-semibold tracking-wide">Additional Patient Information</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              ["Phone Number", addPatient.phone_number],
              ["Primary Language", addPatient.primary_language],
              ["Representative / Power of Attorney", addPatient.power_of_attorney],
              ["Social Security Number", addPatient.social_security_number],
              ["Other Information", addPatient.other_information],
            ].map(([label, val], i) => (
              <div key={i} className={i === 4 ? "sm:col-span-2" : ""}>
                <label className="block text-[11px] text-rcn-muted font-semibold mb-1">{String(label)}</label>
                <div className="text-[13px] p-2.5 border border-dashed border-slate-300/75 rounded-xl bg-slate-50/55">{val != null && val !== "" ? String(val) : "—"}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Primary Care */}
        {Boolean(primaryCare.name || primaryCare.address || primaryCare.phone_number || primaryCare.email) && (
          <div className="border border-rcn-border/60 bg-white/95 rounded-[18px] p-3.5 shadow-sm mb-3.5 overflow-hidden border-l-4 border-l-rcn-brand">
            <div className="-m-3.5 -mt-3.5 mb-3 p-3 border-b border-rcn-border/60 rounded-t-[18px]" style={{ background: BOX_GRAD }}>
              <h4 className="m-0 text-[13px] font-semibold tracking-wide">Primary Care</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                ["Name", primaryCare.name],
                ["Address", primaryCare.address],
                ["Phone", primaryCare.phone_number],
                ["Fax", primaryCare.fax],
                ["Email", primaryCare.email],
                ["NPI", primaryCare.npi],
              ].map(([label, val]) => (
                <div key={String(label)}>
                  <label className="block text-[11px] text-rcn-muted font-semibold mb-1">{String(label)}</label>
                  <div className="text-[13px] p-2.5 border border-dashed border-slate-300/75 rounded-xl bg-slate-50/55">{val != null && val !== "" ? String(val) : "—"}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {refData.additional_notes != null && String(refData.additional_notes).trim() !== "" && (
          <div className="border border-rcn-border/60 bg-white/95 rounded-[18px] p-3.5 shadow-sm mb-3.5 overflow-hidden border-l-4 border-l-rcn-brand">
            <div className="-m-3.5 -mt-3.5 mb-3 p-3 border-b border-rcn-border/60 rounded-t-[18px]" style={{ background: BOX_GRAD }}>
              <h4 className="m-0 text-[13px] font-semibold tracking-wide">Notes</h4>
            </div>
            <div className="text-[13px] p-2.5 border border-dashed border-slate-300/75 rounded-xl bg-slate-50/55">
              {String(refData.additional_notes)}
            </div>
          </div>
        )}

        {/* Billing (if present) */}
        {billing && (billing.senderSendCharged !== undefined || billing.receiverOpenCharged !== undefined) && (
          <div className="border border-rcn-border/60 bg-white/95 rounded-[18px] p-3.5 shadow-sm mb-3.5 overflow-hidden border-l-4 border-l-rcn-brand">
            <div className="-m-3.5 -mt-3.5 mb-3 p-3 border-b border-rcn-border/60 rounded-t-[18px]" style={{ background: BOX_GRAD }}>
              <h4 className="m-0 text-[13px] font-semibold tracking-wide">Billing Status</h4>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#f6fbf7] border border-rcn-border rounded-lg p-2 text-xs">
                <div className="font-semibold mb-1">Sender</div>
                <div>Send charged: {billing.senderSendCharged ? "✅ Yes" : "❌ No"}</div>
                <div>Credit used: {billing.senderUsedCredit ? "✅ Yes" : "❌ No"}</div>
              </div>
              <div className="bg-[#f6fbf7] border border-rcn-border rounded-lg p-2 text-xs">
                <div className="font-semibold mb-1">Receiver</div>
                <div>Open charged: {billing.receiverOpenCharged ? "✅ Yes" : "❌ No"}</div>
                <div>Credit used: {billing.receiverUsedCredit ? "✅ Yes" : "❌ No"}</div>
              </div>
            </div>
          </div>
        )}

        {/* Accept/Reject (receiver view, pending) */}
        {isReceiver && hasPending && (
          <div className="flex gap-2 pt-2">
            <Button
              variant="primary"
              onClick={() => {
                toastWarning("Accept/Reject functionality will be available with API integration.");
                onClose();
              }}
              className="logo-gradient text-white border-0 px-4 py-2.5 rounded-xl cursor-pointer font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Accept Referral
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                toastWarning("Accept/Reject functionality will be available with API integration.");
                onClose();
              }}
            >
              Reject Referral
            </Button>
          </div>
        )}
      </div>

      <PreviewFile url={previewDocUrl ?? ""} isOpen={!!previewDocUrl} onClose={() => setPreviewDocUrl(null)} />
    </Modal>
  );
}
