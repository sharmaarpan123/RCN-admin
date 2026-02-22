"use client";

import React from "react";
import { BOX_GRAD } from "@/components/staffComponents/inbox/sender/view/senderViewHelpers";
import { Button } from "@/components";
import { department_status_type } from "@/app/staff-portal/inbox/receiver/[id]/page";

const SECTION_CLASS =
  "border border-rcn-border/60 bg-white/95 rounded-[18px] p-3.5 shadow-[0_12px_26px_rgba(2,6,23,.07)] relative overflow-hidden border-l-4 border-l-rcn-brand scroll-mt-[120px]";

interface ReceiverAdditionalSectionProps {
  department_status: department_status_type;
  isUnlocked: boolean;
  addPatient: Record<string, string | undefined>;
  /** Sender already paid for this department; show Accept only. */
  senderPaid?: boolean;
  onAccept: () => void;
  onReject: () => void;
  openPayModal: () => void;

}

const ADDITIONAL_ROWS: [string, string][] = [
  ["Phone Number (Must)", "phone_number"],
  ["Primary Language", "primary_language"],
  ["Representative / Power of Attorney", "power_of_attorney"],
  ["Social Security Number", "social_security_number"],
  ["Other Information", "other_information"],
];

export function ReceiverAdditionalSection({
  department_status,
  isUnlocked,
  addPatient,
  senderPaid = false,
  onAccept,
  onReject,
  openPayModal,
}: ReceiverAdditionalSectionProps) {
  return (
    <div id="secAdditional" className={SECTION_CLASS}>
      <div className="-m-3.5 -mt-3.5 mb-3 p-3 border-b border-rcn-border/60 rounded-t-[18px] flex items-center justify-between" style={{ background: BOX_GRAD }}>
        <h4 className="m-0 text-[13px] font-semibold flex items-center gap-2.5">
          <span className="w-[30px] h-[30px] rounded-xl flex items-center justify-center border border-rcn-brand/25 bg-white/70 shadow">🔒</span>
          Additional Patient Information
        </h4>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-black border border-rcn-brand/25 bg-white/70 text-rcn-accent-dark">
          {isUnlocked ? "Payment Completed — Visible" : "Visible Once Payment Is Completed"}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {ADDITIONAL_ROWS.map(([label, key], i) => (
          <div key={key} className={i === 4 ? "sm:col-span-2" : ""}>
            <label className="block text-[11px] text-rcn-muted font-black mb-1">{label}</label>
            <div className="text-[13px] font-semibold text-rcn-text leading-tight p-2.5 border border-dashed border-slate-300/75 rounded-xl bg-slate-50/55">
              {addPatient[key] ?? "—"}
            </div>
          </div>
        ))}
      </div>
      {!isUnlocked && (
        <div className="absolute inset-0 rounded-[18px] bg-slate-900/45 flex items-center justify-center p-4">
          <div className="w-full max-w-[520px] rounded-2xl bg-white/95 border border-slate-200 shadow-[0_20px_50px_rgba(2,6,23,.25)] p-3.5">
            <h5 className="m-0 text-[13px] font-semibold">Locked: Additional Patient Information</h5>
            <p className="m-0 mt-1.5 mb-3 text-rcn-muted text-xs font-semibold">
              Chat is free. To view phone, SSN, and other sensitive fields, payment is required. Use Pay & Unlock in the header to pay.
            </p>
            <div className="flex gap-2.5 flex-wrap justify-end">
              {!senderPaid && department_status?.status !== "rejected" && <Button type="button" variant="primary" size="sm" onClick={openPayModal}>Pay & Unlock</Button>}
              {senderPaid && (
                <Button type="button" variant="primary" size="sm" onClick={onAccept}>
                  Accept (sender already paid)
                </Button>
              )}
              <Button type="button" variant="ghost" size="sm" onClick={onReject} className="border border-red-200 bg-red-50 text-red-700">
                Reject
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
