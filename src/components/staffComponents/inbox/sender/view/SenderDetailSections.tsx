"use client";

import { fmtDate, pillClass, pillLabel } from "@/app/staff-portal/inbox/helpers";
import type { ReceiverInstance, ReferralByIdApi } from "@/app/staff-portal/inbox/types";
import { Button, PreviewFile } from "@/components";
import { toastError } from "@/utils/toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { DocRow } from "./senderViewHelpers";
import { BOX_GRAD } from "./senderViewHelpers";
import { postReferralStartChatApi } from "@/apis/ApiCalls";
import { catchAsync, checkResponse } from "@/utils/commonFunc";

interface SenderDetailSectionsProps {
  data: ReferralByIdApi;

  allReceivers: ReceiverInstance[];

  displayDocRows: DocRow[];

}

export function SenderDetailSections({
  data,


  allReceivers,

  displayDocRows,

}: SenderDetailSectionsProps) {
  const p = data.patient ?? {};
  const ins = data.patient_insurance_information ?? [];
  const primary = ins[0];
  const addPatient = (data.additional_patient ?? {}) as Record<string, string>;
  const router = useRouter();
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);
  const [downloadingDoc, setDownloadingDoc] = useState<Record<string, boolean>>({});

  const startChatWithReceiver = async (referralId: string, departmentId: string) => {
    const res = await postReferralStartChatApi(referralId, { department_id: departmentId });
    if (!checkResponse({ res })) return;
    router.push(`/staff-portal/chat?RedirectedReferralId=${referralId}&department_id=${departmentId}`);
  };

  const downloadDoc = async (url: string, key: string) => {
    setDownloadingDoc(p => ({ ...p, [key]: true }));
    const res = await fetch("/api/download?url=" + url);
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = url.split("/").pop() ?? "downloaded-file";
      a.click();
      setDownloadingDoc(p => ({ ...p, [key]: false }));
    } else {
      setDownloadingDoc(p => ({ ...p, [key]: false }));

      toastError("Failed to download document");
    }
  };


  return (
    <div className="flex flex-col gap-3.5">
      <div id="secBasic" className="border border-rcn-border/60 bg-white/95 rounded-[18px] p-3.5 shadow-[0_12px_26px_rgba(2,6,23,.07)] relative overflow-hidden border-l-4 border-l-rcn-brand scroll-mt-[120px]">
        <div className="-m-3.5 -mt-3.5 mb-3 p-3 border-b border-rcn-border/60 rounded-t-[18px] flex items-center justify-between gap-2.5" style={{ background: BOX_GRAD }}>
          <h4 className="m-0 text-[13px] font-semibold tracking-wide flex items-center gap-2.5">
            <span className="w-[30px] h-[30px] rounded-xl flex items-center justify-center border border-rcn-brand/25 bg-white/70 shadow">👤</span>
            Basic Information
          </h4>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-black border border-rcn-brand/25 bg-white/70 text-rcn-accent-dark">Always Visible</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[
            ["Last Name", p.patient_last_name],
            ["First Name", p.patient_first_name],
            ["Date of Birth (DOB)", p.dob],
            ["Gender", p.gender],
            ["Address of Care", p.address_of_care],
            ["Services Requested", (data.speciality_ids?.map((x) => x.name) ?? []).join(", ")],
            ["Primary Insurance", primary ? `${primary.payer ?? ""} • Policy: ${primary.policy ?? ""}` : ""],
            ["Additional Insurances", ins.length > 1 ? ins.slice(1).map((x) => `${x.payer ?? ""} • ${x.policy ?? ""}`).join(" | ") : "None"],
          ].map(([label, val]) => (
            <div key={String(label)}>
              <label className="block text-[11px] text-rcn-muted font-black mb-1">{label}</label>
              <div className="text-[13px] font-[850] text-rcn-text leading-tight p-2.5 border border-dashed border-slate-300/75 rounded-xl bg-slate-50/55">{val ?? "—"}</div>
            </div>
          ))}
        </div>
      </div>

      <div id="secReceivers" className="border border-rcn-border/60 bg-white/95 rounded-[18px] p-3.5 shadow relative overflow-hidden border-l-4 border-l-rcn-brand scroll-mt-[120px]">
        <div className="-m-3.5 -mt-3.5 mb-3 p-3 border-b border-rcn-border/60 rounded-t-[18px] flex items-center justify-between" style={{ background: BOX_GRAD }}>
          <h4 className="m-0 text-[13px] font-semibold flex items-center gap-2.5">
            <span className="w-[30px] h-[30px] rounded-xl flex items-center justify-center border border-rcn-brand/25 bg-white/70 shadow">📬</span>
            Receivers & Status
          </h4>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-black border border-rcn-brand/25 bg-white/70 text-rcn-accent-dark">Message at any status</span>
        </div>
        <div className="overflow-hidden rounded-[14px] border border-slate-200 bg-white">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                <th className="text-left p-2.5 bg-rcn-brand/10 text-rcn-text font-black text-[11px] uppercase tracking-wide">Receiver</th>
                <th className="text-left p-2.5 bg-rcn-brand/10 font-black text-[11px] uppercase">Status</th>
                <th className="text-left p-2.5 bg-rcn-brand/10 font-black text-[11px] uppercase">Last Update</th>
                <th className="text-left p-2.5 bg-rcn-brand/10 font-black text-[11px] uppercase">Payment</th>
                <th className="text-left p-2.5 bg-rcn-brand/10 font-black text-[11px] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allReceivers.map((rx) => (
                <tr key={rx.receiverId} className="border-t border-slate-200">
                  <td className="p-2.5 align-top">
                    <strong>{rx.name}</strong>
                    {rx.email && <div className="text-rcn-muted text-xs">{rx.email}</div>}
                    {rx.status === "REJECTED" && rx.rejectReason && <div className="text-rcn-muted text-xs">Reason: {rx.rejectReason}</div>}
                    {rx.servicesRequestedOverride?.length && <div className="text-rcn-muted text-xs">Services override: {rx.servicesRequestedOverride.join(", ")}</div>}
                  </td>
                  <td className="p-2.5"><span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-black border ${pillClass(rx.status)}`}>{pillLabel(rx.status)}</span></td>
                  <td className="p-2.5">{fmtDate(rx.updatedAt)}</td>
                  <td className="p-2.5">{rx.paidUnlocked ? <span className={`inline-flex px-2.5 py-1.5 rounded-full text-[11px] font-black border ${pillClass("PAID")}`}>Paid</span> : <span className={`inline-flex px-2.5 py-1.5 rounded-full text-[11px] font-black border ${pillClass("PENDING")}`}>Not paid</span>}</td>
                  <td className="p-2.5">
                    <button type="button" onClick={() => startChatWithReceiver(data?._id, rx.departmentId)} className="border border-rcn-brand/25 bg-rcn-brand/10 text-rcn-accent-dark px-2 py-1.5 rounded-xl font-extrabold text-xs shadow mr-1">Chat</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div id="secDocs" className="border border-rcn-border/60 bg-white/95 rounded-[18px] p-3.5 shadow relative overflow-hidden border-l-4 border-l-rcn-brand scroll-mt-[120px]">
        <div className="-m-3.5 -mt-3.5 mb-3 p-3 border-b border-rcn-border/60 rounded-t-[18px] flex items-center justify-between" style={{ background: BOX_GRAD }}>
          <h4 className="m-0 text-[13px] font-semibold flex items-center gap-2.5">
            <span className="w-[30px] h-[30px] rounded-xl flex items-center justify-center border border-rcn-brand/25 bg-white/70 shadow">📎</span>
            Attached Documents
          </h4>
        </div>
        <div className="gap-3 align-top">
          <div className="overflow-hidden rounded-[14px] border border-slate-200 bg-white">
            {displayDocRows.length > 0 ? (
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr>
                    <th className="text-left p-2.5 bg-rcn-brand/10 font-black text-[11px] uppercase">Document</th>

                    <th className="text-left p-2.5 bg-rcn-brand/10 font-black text-[11px] uppercase">View</th>
                  </tr>
                </thead>
                <tbody>
                  {displayDocRows.map((d, idx) => (
                    <tr key={idx} className="border-t border-slate-200">
                      <td className="p-2.5"><strong>{d.label}</strong>{d.url && <div className="text-rcn-muted text-xs">File: {d.url}</div>}</td>
                      <td className="p-2.5">
                        {d.url ? (
                          <div className="flex gap-2">

                            <Button
                              type="button"
                              onClick={() => setPreviewDocUrl(d.url)}
                              className="border border-rcn-brand/25 bg-rcn-brand/10 text-rcn-accent-dark px-2 py-1.5 rounded-xl text-xs font-extrabold shadow"
                            >
                              View document
                            </Button>
                            <Button
                              type="button"
                              onClick={() => downloadDoc(d.url, d.label)}
                              className="border border-rcn-brand/25 bg-rcn-brand/10 text-rcn-accent-dark px-2 py-1.5 rounded-xl text-xs font-extrabold shadow"
                            >
                              {downloadingDoc[d.label] ? <span className="animate-spin">🔄</span> : "Download"}
                            </Button>
                          </div>
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
      </div>

      <div id="secAdditional" className="border border-rcn-border/60 bg-white/95 rounded-[18px] p-3.5 shadow relative overflow-hidden border-l-4 border-l-rcn-brand scroll-mt-[120px]">
        <div className="-m-3.5 -mt-3.5 mb-3 p-3 border-b border-rcn-border/60 rounded-t-[18px] flex items-center justify-between" style={{ background: BOX_GRAD }}>
          <h4 className="m-0 text-[13px] font-semibold flex items-center gap-2.5">
            <span className="w-[30px] h-[30px] rounded-xl flex items-center justify-center border border-rcn-brand/25 bg-white/70 shadow">🔒</span>
            Additional Patient Information
          </h4>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-black border border-rcn-brand/25 bg-white/70 text-rcn-accent-dark">Visible Once Payment Is Completed</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[
            ["Phone Number (Must)", addPatient.phone_number],
            ["Primary Language", addPatient.primary_language],
            ["Representative / Power of Attorney", addPatient.power_of_attorney],
            ["Social Security Number", addPatient.social_security_number],
            ["Other Information", addPatient.other_information ?? "—"],
          ].map(([label, val], i) => (
            <div key={i} className={i === 4 ? "sm:col-span-2" : ""}>
              <label className="block text-[11px] text-rcn-muted font-black mb-1">{label}</label>
              <div className="text-[13px] font-[850] text-rcn-text leading-tight p-2.5 border border-dashed border-slate-300/75 rounded-xl bg-slate-50/55">{val ?? "—"}</div>
            </div>
          ))}
        </div>
      </div>





      <PreviewFile
        url={previewDocUrl ?? ""}
        isOpen={!!previewDocUrl}
        onClose={() => setPreviewDocUrl(null)}
      />
    </div>
  );
}
