"use client";

import React from "react";
import { SectionHeader } from "./SectionHeader";

interface AdditionalDetailsSectionProps {
  phone: string;
  setPhone: (v: string) => void;
  language: string;
  setLanguage: (v: string) => void;
  ssn: string;
  setSsn: (v: string) => void;
  representative: string;
  setRepresentative: (v: string) => void;
  otherInfo: string;
  setOtherInfo: (v: string) => void;
}

export function AdditionalDetailsSection({
  phone,
  setPhone,
  language,
  setLanguage,
  ssn,
  setSsn,
  representative,
  setRepresentative,
  otherInfo,
  setOtherInfo,
}: AdditionalDetailsSectionProps) {
  return (
    <section
      id="additional-details"
      className="bg-white border border-rcn-border rounded-2xl shadow-rcn p-4.5 mb-3.5 overflow-hidden relative"
    >
      <SectionHeader
        title="Additional Patient Details"
        subtitle="Visible to receiver after payment/unlock"
        badge="Phone required"
      />

      <div className="border border-rcn-border/60 bg-[#eef8f1] border-[#cfe6d6] rounded-[14px] p-3 mb-3">
        <p className="m-0 text-sm text-rcn-text mb-2">
          These additional details will be visible to the Referral Receiver after payment/unlock
          (unless the Referral Sender purchased the referral, in which case the Receiver can view
          without paying).
        </p>
        <p className="m-0 text-sm text-rcn-text mb-2">
          Without unlocking additional details, the receiver can still verify the patient&apos;s
          insurance and choose to accept or decline the referral. This helps ensure the receiver
          does not incur costs for services that are not covered or not appropriate.
        </p>
        <p className="m-0 text-sm text-rcn-text">
          The communication channel (chat/messaging) will remain closed until the receiver pays to
          unlock the referral, at which point full details become available and the receiver can
          communicate with the sender.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
            Phone Number <span className="text-rcn-danger font-black">*</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
          />
        </div>
        <div>
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
            Primary Language
          </label>
          <input
            type="text"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
          />
        </div>
        <div>
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
            Social Security Number
          </label>
          <input
            type="text"
            value={ssn}
            onChange={(e) => setSsn(e.target.value)}
            placeholder="XXX-XX-XXXX"
            className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
          />
        </div>
        <div>
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
            Patient-selected representative or power of attorney
          </label>
          <input
            type="text"
            value={representative}
            onChange={(e) => setRepresentative(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
            Other Information
          </label>
          <textarea
            value={otherInfo}
            onChange={(e) => setOtherInfo(e.target.value)}
            placeholder="Additional details visible after receiver unlock..."
            className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal min-h-[95px] resize-y focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
          />
        </div>
      </div>
    </section>
  );
}
