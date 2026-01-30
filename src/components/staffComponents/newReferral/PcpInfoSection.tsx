"use client";

import React from "react";
import { SectionHeader } from "./SectionHeader";

interface PcpInfoSectionProps {
  pcpName: string;
  setPcpName: (v: string) => void;
  pcpAddress: string;
  setPcpAddress: (v: string) => void;
  pcpTel: string;
  setPcpTel: (v: string) => void;
  pcpFax: string;
  setPcpFax: (v: string) => void;
  pcpEmail: string;
  setPcpEmail: (v: string) => void;
  pcpNpi: string;
  setPcpNpi: (v: string) => void;
}

export function PcpInfoSection({
  pcpName,
  setPcpName,
  pcpAddress,
  setPcpAddress,
  pcpTel,
  setPcpTel,
  pcpFax,
  setPcpFax,
  pcpEmail,
  setPcpEmail,
  pcpNpi,
  setPcpNpi,
}: PcpInfoSectionProps) {
  return (
    <section
      id="pcp-info"
      className="bg-white border border-rcn-border rounded-2xl shadow-rcn p-4.5 mb-3.5 overflow-hidden relative"
    >
      <SectionHeader
        title="Primary Care Physician Information"
        subtitle="Enter patient's primary care physician details"
        badge="Optional"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="md:col-span-2">
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5">Name</label>
          <input
            type="text"
            value={pcpName}
            onChange={(e) => setPcpName(e.target.value)}
            placeholder="PCP full name"
            className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5">Address</label>
          <input
            type="text"
            value={pcpAddress}
            onChange={(e) => setPcpAddress(e.target.value)}
            placeholder="Street, City, State, ZIP"
            className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
          />
        </div>
        <div>
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5">Tel</label>
          <input
            type="tel"
            value={pcpTel}
            onChange={(e) => setPcpTel(e.target.value)}
            placeholder="(xxx) xxx-xxxx"
            className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
          />
        </div>
        <div>
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5">Fax</label>
          <input
            type="tel"
            value={pcpFax}
            onChange={(e) => setPcpFax(e.target.value)}
            placeholder="(xxx) xxx-xxxx"
            className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
          />
        </div>
        <div>
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5">Email</label>
          <input
            type="email"
            value={pcpEmail}
            onChange={(e) => setPcpEmail(e.target.value)}
            placeholder="pcp@example.com"
            className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
          />
        </div>
        <div>
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5">NPI</label>
          <input
            type="text"
            value={pcpNpi}
            onChange={(e) => setPcpNpi(e.target.value)}
            placeholder="NPI number"
            className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
          />
        </div>
      </div>
    </section>
  );
}
