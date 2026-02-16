"use client";

import React from "react";
import { BOX_GRAD } from "@/components/staffComponents/inbox/sender/view/senderViewHelpers";

const SECTION_CLASS =
  "border border-rcn-border/60 bg-white/95 rounded-[18px] p-3.5 shadow-[0_12px_26px_rgba(2,6,23,.07)] relative overflow-hidden border-l-4 border-l-rcn-brand scroll-mt-[120px]";

interface ReceiverAdditionalSectionProps {
  isUnlocked: boolean;
  receiverStatus: string;
  addPatient: Record<string, string | undefined>;
  onPayUnlock: () => void;
  onReject: () => void;
}

export function ReceiverAdditionalSection({
  isUnlocked,
  receiverStatus,
  addPatient,
  onPayUnlock,
  onReject,
}: ReceiverAdditionalSectionProps) {
  const rows: [string, string | undefined][] = [
    ["Phone Number (Must)", addPatient.phone_number],
    ["Primary Language", addPatient.primary_language],
    ["Representative / Power of Attorney", addPatient.power_of_attorney],
    ["Social Security Number", addPatient.social_security_number],
    ["Other Information", addPatient.other_information ?? "—"],
  ];

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
        {rows.map(([label, val], i) => (
          <div key={label} className={i === 4 ? "sm:col-span-2" : ""}>
            <label className="block text-[11px] text-rcn-muted font-black mb-1">{label}</label>
            <div className="text-[13px] font-[850] text-rcn-text leading-tight p-2.5 border border-dashed border-slate-300/75 rounded-xl bg-slate-50/55">{val ?? "—"}</div>
          </div>
        ))}
      </div>
      {!isUnlocked && (
        <div className="absolute inset-0 rounded-[18px] bg-slate-900/45 flex items-center justify-center p-4">
          <div className="w-full max-w-[520px] rounded-2xl bg-white/95 border border-slate-200 shadow-[0_20px_50px_rgba(2,6,23,.25)] p-3.5">
            <h5 className="m-0 text-[13px] font-semibold">Locked: Additional Patient Information</h5>
            <p className="m-0 mt-1.5 mb-3 text-rcn-muted text-xs font-[850]">Chat is free. To view phone, SSN, and other sensitive fields, payment is required. Payment flow will be added soon.</p>
            <div className="flex gap-2.5 flex-wrap justify-end">
              {receiverStatus === "ACCEPTED" && <button type="button" onClick={onPayUnlock} className="border border-rcn-brand/25 bg-rcn-brand/10 text-rcn-accent-dark px-2.5 py-2 rounded-xl font-extrabold text-xs shadow">Pay & Unlock</button>}
              <button type="button" onClick={onReject} className="border border-red-200 bg-red-50 text-red-700 px-2.5 py-2 rounded-xl font-extrabold text-xs shadow">Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
