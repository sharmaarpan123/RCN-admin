"use client";

import { SectionHeader } from "./SectionHeader";

export function SenderInfoSection() {
  return (
    <section
      id="sender-info"
      className="bg-white border border-rcn-border rounded-2xl shadow-rcn p-4.5 mb-3.5 overflow-hidden relative"
    >
      <SectionHeader
        title="Person/Facility Sending Referral"
        subtitle="Automatically included by the system"
        badge="Auto-filled"
      />
      <p className="text-xs text-rcn-muted mb-3">
        Facility name, address, email, phone number, and fax number are auto-filled.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[
          "Sender Name",
          "Facility Name",
          "Facility Address",
          "Email",
          "Phone Number",
          "Fax Number",
        ].map((label) => (
          <div key={label}>
            <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
              {label}
            </label>
            <input
              type="text"
              placeholder="Auto-filled"
              disabled
              className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-slate-50 text-rcn-muted text-sm"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
