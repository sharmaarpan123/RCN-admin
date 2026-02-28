"use client";

import React, { useState } from "react";
import { pillClass } from "@/app/staff-portal/inbox/helpers";
import { BOX_GRAD } from "@/components/staffComponents/inbox/sender/view/senderViewHelpers";
import Button from "@/components/Button";
import { PreviewFile } from "@/components/PreviewFile";

const SECTION_CLASS =
  "border border-rcn-border/60 bg-white/95 rounded-[18px] p-3.5 shadow-[0_12px_26px_rgba(2,6,23,.07)] relative overflow-hidden border-l-4 border-l-rcn-brand scroll-mt-[120px] min-h-[300px]";

interface AdditionalInsuranceItem {
  _id?: string;
  payer?: string | null;
  policy?: string | null;
  plan_group?: string | null;
  document?: string | null;
}

interface ReceiverBasicSectionProps {
  receiverStatus: string;
  patient: Record<string, unknown>;

  additionalInsurances: AdditionalInsuranceItem[];
  servicesForDisplay: { name: string; user_id?: string; _id?: string }[];
  onPayUnlock: () => void;
  onReject: () => void;
}

export function ReceiverBasicSection({
  receiverStatus,
  patient,

  additionalInsurances,
  servicesForDisplay,

}: ReceiverBasicSectionProps) {
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);
  const p = patient as { patient_last_name?: string; patient_first_name?: string; dob?: string; gender?: string; address_of_care?: string };

  const hasValue = (v: string | null | undefined) => (v ?? "").toString().trim() !== "";

  return (
    <div id="secBasic" className={SECTION_CLASS}>
      <div className="-m-3.5 -mt-3.5 mb-3 p-3 border-b border-rcn-border/60 rounded-t-[18px] flex items-center justify-between gap-2.5" style={{ background: BOX_GRAD }}>
        <h4 className="m-0 text-[13px] font-semibold tracking-wide flex items-center gap-2.5">
          <span className="w-[30px] h-[30px] rounded-xl flex items-center justify-center border border-rcn-brand/25 bg-white/70 shadow">👤</span>
          Basic Patient Information
        </h4>
      </div>
      {/* {isUnlocked ? ( */}
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[
            ["Last Name", p.patient_last_name],
            ["First Name", p.patient_first_name],
            ["Date of Birth (DOB)", p.dob],
            ["Gender", p.gender],
            ["Address of Care", p.address_of_care],
            ["Services Requested", servicesForDisplay?.map((x) => x.name).join(", ")],
          ].map(([label, val]) => (
            <div key={String(label)}>
              <label className="block text-[11px] text-rcn-muted font-black mb-1">{label}</label>
              <div className="text-[13px] font-semibold text-rcn-text leading-tight p-2.5 border border-dashed border-slate-300/75 rounded-xl bg-slate-50/55">{val ?? "—"}</div>
            </div>
          ))}
        </div>
        
        {additionalInsurances?.length ? (
          <div className="mt-3.5 space-y-3">
            <h5 className="text-[11px] text-rcn-muted font-black uppercase tracking-wide mb-2">Additional Insurances</h5>
            {additionalInsurances.map((x, index) => {
              const { payer, policy, plan_group, document } = x;
              const docUrl = hasValue(document) ? (document ?? "").trim() : null;
              return (
                <div
                  key={x._id ?? `ins-${index}`}
                  className="rounded-xl border border-slate-200/90 bg-slate-50/40 p-3 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="text-[11px] font-black text-rcn-muted">Insurance #{index + 1}</span>
                    {docUrl && (
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => setPreviewDocUrl(docUrl)}
                        className="text-xs text-rcn-brand font-semibold hover:underline"
                      >
                        View document
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      ["Payer", payer],
                      ["Policy", policy],
                      ["Plan Group", plan_group],
                    ].map(([label, val]) => (
                      <div key={String(label)}>
                        <label className="block text-[11px] text-rcn-muted font-black mb-1">{label}</label>
                        <div className="text-[13px] font-semibold text-rcn-text leading-tight p-2 border border-dashed border-slate-300/75 rounded-lg bg-white/80">
                          {hasValue(val) ? val : "—"}
                        </div>
                      </div>
                    ))}
                  </div>
                  {!docUrl && (
                    <p className="text-[11px] text-rcn-muted mt-2 italic">No document attached</p>
                  )}
                </div>
              );
            })}
          </div>
        ) : null}
      </>
      <PreviewFile
        url={previewDocUrl ?? ""}
        isOpen={!!previewDocUrl}
        onClose={() => setPreviewDocUrl(null)}
        fileType="image"
      />
    </div >
  );
}
