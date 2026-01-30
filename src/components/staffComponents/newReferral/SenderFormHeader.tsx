"use client";

import React from "react";

export function SenderFormHeader() {
  return (
    <section
      id="sender-form"
      className="bg-white border border-rcn-border rounded-2xl shadow-rcn p-4.5 mb-3.5 overflow-hidden relative"
    >
      <div className="flex items-start justify-between gap-3 p-3.5 -m-4.5 -mt-4.5 mb-4 border-b border-rcn-border bg-gradient-to-b from-[#f6fbf7] to-white rounded-t-2xl relative">
        <div className="pl-3 flex flex-col gap-0.5">
          <h2 className="m-0 text-lg font-semibold tracking-wide">
            Patient Referral Form (Sender)
          </h2>
          <p className="m-0 text-xs text-rcn-muted font-[850]">
            Send a referral to one or multiple receivers.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-black border border-rcn-border bg-white text-rcn-muted whitespace-nowrap">
          Sender uploads documents
        </span>
        <div className="absolute left-0 top-3 bottom-3 w-1.5 rounded-full bg-rcn-brand/92" />
      </div>
    </section>
  );
}
