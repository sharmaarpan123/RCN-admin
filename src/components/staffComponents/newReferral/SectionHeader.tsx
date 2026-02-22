"use client";

import React from "react";

interface SectionHeaderProps {
  title: string;
  subtitle: string;
  badge?: string;
}

export function SectionHeader({ title, subtitle, badge }: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-3 p-3.5 -m-4.5 -mt-4.5 mb-4 border-b border-rcn-border bg-gradient-to-b from-[#f6fbf7] to-white rounded-t-2xl relative">
      <div className="pl-3 flex flex-col gap-0.5">
        <h2 className="m-0 text-lg font-semibold tracking-wide">{title}</h2>
        <p className="m-0 text-xs text-rcn-muted font-semibold">{subtitle}</p>
      </div>
      {badge && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-black border border-rcn-border bg-white text-rcn-muted whitespace-nowrap">
          {badge}
        </span>
      )}
      <div className="absolute left-0 top-3 bottom-3 w-1.5 rounded-full bg-rcn-brand/92" />
    </div>
  );
}
