"use client";

import React from "react";
import { NAV_ITEMS } from "./types";

interface NewReferralNavProps {
  activeSection: string;
  onSectionChange: (id: string) => void;
}

export function NewReferralNav({ activeSection, onSectionChange }: NewReferralNavProps) {
  return (
    <nav className="md:sticky top-[5px] z-20 mb-3.5">
      <div className="bg-gradient-to-b from-rcn-brand to-rcn-brand-light border border-slate-200/60 rounded-2xl shadow-sm p-3">
        <div className="flex items-center gap-2.5 flex-wrap overflow-x-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  onSectionChange(item.id);
                  const element = document.getElementById(item.id);
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-[#d4f4e0] border border-[#4ade80] text-rcn-text shadow-sm"
                    : "bg-white border border-slate-300 text-rcn-text hover:bg-slate-50"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    isActive ? "bg-[#22c55e]" : "bg-slate-400"
                  }`}
                />
                {item.label}
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
