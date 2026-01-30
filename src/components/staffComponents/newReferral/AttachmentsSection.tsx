"use client";

import React from "react";
import { SectionHeader } from "./SectionHeader";

const ATTACHMENT_LABELS = [
  "Face Sheet",
  "Medication List",
  "Discharge Summary",
  "Wound Photos",
  "Signed Order",
  "History & Physical",
  "Progress Note",
];

export function AttachmentsSection() {
  return (
    <section
      id="attachments"
      className="bg-white border border-rcn-border rounded-2xl shadow-rcn p-4.5 mb-3.5 overflow-hidden relative"
    >
      <SectionHeader
        title="Attached Documents (Sender)"
        subtitle="Upload supporting documents for the referral"
        badge="Optional"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {ATTACHMENT_LABELS.map((label) => (
          <div key={label}>
            <label className="block text-xs text-rcn-muted font-[850] mb-1.5">{label}</label>
            <input
              type="file"
              multiple={label === "Wound Photos"}
              accept={label === "Wound Photos" ? "image/*" : undefined}
              className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white text-sm"
            />
          </div>
        ))}
        <div className="md:col-span-2">
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
            Other Documents
          </label>
          <input
            type="file"
            multiple
            className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white text-sm"
          />
        </div>
      </div>
    </section>
  );
}
