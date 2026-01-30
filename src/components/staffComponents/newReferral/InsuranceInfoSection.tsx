"use client";

import React from "react";
import { SectionHeader } from "./SectionHeader";
import type { InsuranceBlock } from "./types";

interface InsuranceInfoSectionProps {
  primaryPayer: string;
  setPrimaryPayer: (v: string) => void;
  primaryPolicy: string;
  setPrimaryPolicy: (v: string) => void;
  primaryPlanGroup: string;
  setPrimaryPlanGroup: (v: string) => void;
  insuranceBlocks: InsuranceBlock[];
  addInsuranceBlock: () => void;
  removeInsuranceBlock: (id: number) => void;
  updateInsuranceBlock: (id: number, field: keyof InsuranceBlock, value: string) => void;
}

export function InsuranceInfoSection({
  primaryPayer,
  setPrimaryPayer,
  primaryPolicy,
  setPrimaryPolicy,
  primaryPlanGroup,
  setPrimaryPlanGroup,
  insuranceBlocks,
  addInsuranceBlock,
  removeInsuranceBlock,
  updateInsuranceBlock,
}: InsuranceInfoSectionProps) {
  return (
    <section
      id="insurance-info"
      className="bg-white border border-rcn-border rounded-2xl shadow-rcn p-4.5 mb-3.5 overflow-hidden relative"
    >
      <SectionHeader
        title="Patient Insurance Information"
        subtitle="Primary required; additional insurance optional"
        badge="Documents optional"
      />

      <div className="border border-dashed border-rcn-border bg-[#fbfdfb] rounded-[14px] p-3 mb-3">
        <div className="flex items-center justify-between gap-2.5 mb-2.5">
          <strong className="text-xs font-black">Primary Insurance (Required)</strong>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-black border border-rcn-border bg-white text-rcn-muted">
            Required
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
              Payer <span className="text-rcn-danger font-black">*</span>
            </label>
            <input
              type="text"
              value={primaryPayer}
              onChange={(e) => setPrimaryPayer(e.target.value)}
              placeholder="e.g., BCBS, Aetna, Medicare"
              required
              className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
            />
          </div>
          <div>
            <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
              Policy # <span className="text-rcn-danger font-black">*</span>
            </label>
            <input
              type="text"
              value={primaryPolicy}
              onChange={(e) => setPrimaryPolicy(e.target.value)}
              placeholder="Policy / Member ID"
              required
              className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
            />
          </div>
          <div>
            <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
              Plan/Group <span className="text-rcn-danger font-black">*</span>
            </label>
            <input
              type="text"
              value={primaryPlanGroup}
              onChange={(e) => setPrimaryPlanGroup(e.target.value)}
              placeholder="Plan / Group"
              required
              className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
            />
          </div>
        </div>
        <p className="text-xs text-rcn-muted mt-2.5">Upload insurance document(s) (optional).</p>
        <label className="block text-xs text-rcn-muted font-[850] mb-1.5 mt-2.5">
          Upload Insurance Document(s)
        </label>
        <input
          type="file"
          multiple
          className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white text-sm"
        />
      </div>

      {insuranceBlocks.map((block) => (
        <div
          key={block.id}
          className="border border-dashed border-rcn-border bg-[#fbfdfb] rounded-[14px] p-3 mb-3"
        >
          <div className="flex items-center justify-between gap-2.5 mb-2.5">
            <strong className="text-xs font-black">
              Additional Insurance (Optional) #{block.id}
            </strong>
            <button
              type="button"
              onClick={() => removeInsuranceBlock(block.id)}
              className="border border-red-200 bg-red-50 text-red-700 px-2.5 py-1.5 rounded-xl text-xs font-extrabold shadow"
            >
              Remove
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-rcn-muted font-[850] mb-1.5">Payer</label>
              <input
                type="text"
                value={block.payer}
                onChange={(e) => updateInsuranceBlock(block.id, "payer", e.target.value)}
                placeholder="e.g., BCBS, Aetna, Medicare"
                className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
              />
            </div>
            <div>
              <label className="block text-xs text-rcn-muted font-[850] mb-1.5">Policy #</label>
              <input
                type="text"
                value={block.policy}
                onChange={(e) => updateInsuranceBlock(block.id, "policy", e.target.value)}
                placeholder="Policy / Member ID"
                className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
              />
            </div>
            <div>
              <label className="block text-xs text-rcn-muted font-[850] mb-1.5">Plan/Group</label>
              <input
                type="text"
                value={block.planGroup}
                onChange={(e) => updateInsuranceBlock(block.id, "planGroup", e.target.value)}
                placeholder="Plan / Group"
                className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12"
              />
            </div>
          </div>
          <p className="text-xs text-rcn-muted mt-2.5">
            Upload insurance document(s) (optional).
          </p>
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5 mt-2.5">
            Upload Insurance Document(s)
          </label>
          <input
            type="file"
            multiple
            className="w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white text-sm"
          />
        </div>
      ))}

      <button
        type="button"
        onClick={addInsuranceBlock}
        className="w-full flex items-center justify-center gap-2.5 px-3 py-2.5 rounded-[14px] bg-gradient-to-b from-rcn-brand to-rcn-brand-light text-white border border-black/6 shadow-[0_10px_18px_rgba(47,125,79,.22)] font-black text-xs hover:brightness-[1.03] hover:-translate-y-px active:translate-y-0 transition-all mt-3"
      >
        <span className="w-6.5 h-6.5 rounded-xl bg-white/18 flex items-center justify-center text-base">
          ＋
        </span>
        <span>Add Another Additional Insurance (Optional)</span>
      </button>
      <p className="text-xs text-rcn-muted text-center mt-1.5">
        Add another insurance payer (optional).
      </p>
    </section>
  );
}
