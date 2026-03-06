"use client";

import React from "react";
import { Button } from "@/components";
import { BOX_GRAD } from "@/components/staffComponents/inbox/sender/view/senderViewHelpers";
import { department_status_type } from "@/app/staff-portal/inbox/receiver/[id]/page";

const SECTION_CLASS =
  "border border-rcn-border/60 bg-white/95 rounded-[18px] p-3.5 shadow-[0_12px_26px_rgba(2,6,23,.07)] relative overflow-hidden border-l-4 border-l-rcn-brand scroll-mt-[120px]";

export interface PrimaryCareData {
  name?: string;
  address?: string;
  phone_number?: string;
  dial_code?: string;
  fax?: string;
  email?: string;
  npi?: string;
}

interface ReceiverPrimaryCareSectionProps {
  isUnlocked: boolean;
  primaryCare: PrimaryCareData;
  openPayModal: () => void;
  senderPaid: boolean;
  department_status: department_status_type;
  onAccept: () => void;
  onReject: () => void;
}

export function ReceiverPrimaryCareSection({
  isUnlocked,
  primaryCare,
  openPayModal,
  senderPaid,
  department_status,
  onAccept,
  onReject,
}: ReceiverPrimaryCareSectionProps) {
  const hasData =
    primaryCare.name ||
    primaryCare.address ||
    primaryCare.phone_number ||
    primaryCare.email ||
    primaryCare.fax ||
    primaryCare.npi;

  if (!hasData) return null;

  const phoneDisplay =
    primaryCare.dial_code && primaryCare.phone_number
      ? `${primaryCare.dial_code} ${primaryCare.phone_number}`
      : primaryCare.phone_number;

  const rows: [string, string | undefined][] = [
    ["Name", primaryCare.name || "—"],
    ["Address", primaryCare.address || "—"],
    ["Phone", phoneDisplay || "—"],
    ["Fax", primaryCare.fax || "—"],
    ["Email", primaryCare.email || "—"],
    ["NPI", primaryCare.npi || "—"],
  ];

  return (
    <div id="secPrimaryCare" className={SECTION_CLASS}>
      <div
        className="-m-3.5 -mt-3.5 mb-3 p-3 border-b border-rcn-border/60 rounded-t-[18px] flex items-center justify-between"
        style={{ background: BOX_GRAD }}
      >
        <h4 className="m-0 text-[13px] font-semibold flex items-center gap-2.5">
          <span className="w-[30px] h-[30px] rounded-xl flex items-center justify-center border border-rcn-brand/25 bg-white/70 shadow">
            🏥
          </span>
          Primary Care{" "}
          <span className="text-[11px] font-normal text-rcn-muted">
            (optional)
          </span>
        </h4>
        {!isUnlocked && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-black border border-rcn-brand/25 bg-white/70 text-rcn-accent-dark">
            Pay to view
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 relative p-2">
      {!isUnlocked && (
        <div className="absolute inset-0 rounded-[18px] backdrop-blur-md  bg-slate-900/80 flex items-center justify-center p-4">
          <div className="w-full max-w-[400px] rounded-2xl bg-white/95 border border-slate-200 shadow-[0_20px_50px_rgba(2,6,23,.25)] p-3.5">
            <h5 className="m-0 text-[13px] font-semibold">
              Locked: Primary Care
            </h5>
            <p className="m-0 mt-1.5 mb-3 text-rcn-muted text-xs font-semibold">
              Pay & Unlock to view primary care contact details.
            </p>
            {/* {!senderPaid && department_status?.status !== "rejected" && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={openPayModal}
              >
                Pay & Unlock
              </Button>
            )}
            {senderPaid && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={onAccept}
              >
                Accept (sender already paid)
              </Button>
            )}
            <Button
              disabled={department_status?.status == "rejected"}
              type="button"
              variant="ghost"
              size="sm"
              onClick={onReject}
              className="border border-red-200 bg-red-50 text-red-700"
            >
              {department_status?.status == "rejected" ? "Rejected" : "Reject"}
            </Button> */}
          </div>
        </div>
      )}
        {rows.map(([label, val]) => (
          <div key={label}>
            <label className="block text-[11px] text-rcn-muted font-black mb-1">
              {label}
            </label>
            <div className="text-[13px] font-semibold text-rcn-text leading-tight p-2.5 border border-dashed border-slate-300/75 rounded-xl bg-slate-50/55">
              {val ?? "—"}
            </div>
          </div>
        ))}
      </div>
     
    </div>
  );
}
