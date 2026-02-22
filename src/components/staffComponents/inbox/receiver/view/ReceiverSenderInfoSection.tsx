"use client";

import React from "react";
import { BOX_GRAD } from "@/components/staffComponents/inbox/sender/view/senderViewHelpers";

const SECTION_CLASS =
  "border border-rcn-border/60 bg-white/95 rounded-[18px] p-3.5 shadow-[0_12px_26px_rgba(2,6,23,.07)] relative overflow-hidden border-l-4 border-l-rcn-brand scroll-mt-[120px]";

export interface SenderInfoData {
  sender_name?: string;
  facility_name?: string;
  facility_address?: string;
  sender_email?: string;
  sender_phone_number?: string;
  sender_fax_number?: string;
  sender_dial_code?: string;
}

interface ReceiverSenderInfoSectionProps {
  data: SenderInfoData;
}

export function ReceiverSenderInfoSection({ data }: ReceiverSenderInfoSectionProps) {
  const senderPhoneDisplay =
    data.sender_dial_code && data.sender_phone_number
      ? `${data.sender_dial_code} ${data.sender_phone_number}`.trim()
      : data.sender_phone_number ?? "";

  return (
    <div id="secSenderInfo" className={SECTION_CLASS}>
      <div
        className="-m-3.5 -mt-3.5 mb-3 p-3 border-b border-rcn-border/60 rounded-t-[18px] flex items-center justify-between gap-2.5"
        style={{ background: BOX_GRAD }}
      >
        <h4 className="m-0 text-[13px] font-semibold tracking-wide flex items-center gap-2.5">
          <span className="w-[30px] h-[30px] rounded-xl flex items-center justify-center border border-rcn-brand/25 bg-white/70 shadow">
            🏢
          </span>
          Person/Facility Sending Referral
        </h4>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-black border border-rcn-brand/25 bg-white/70 text-rcn-accent-dark">
          Sender
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {[
          ["Sender Name", data.sender_name],
          ["Facility Name", data.facility_name],
          ["Facility Address", data.facility_address],
          ["Email", data.sender_email],
          ["Phone Number", senderPhoneDisplay],
          ["Fax Number", data.sender_fax_number],
        ].map(([label, val]) => (
          <div
            key={String(label)}
            className={label === "Facility Address" ? "sm:col-span-2" : ""}
          >
            <label className="block text-[11px] text-rcn-muted font-black mb-1">
              {label}
            </label>
            <div className="text-[13px] font-[850] text-rcn-text leading-tight p-2.5 border border-dashed border-slate-300/75 rounded-xl bg-slate-50/55">
              {val || "—"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
