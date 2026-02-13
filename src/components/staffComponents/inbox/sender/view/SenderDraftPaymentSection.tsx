"use client";

import React from "react";
import { BOX_GRAD } from "./senderViewHelpers";

interface SenderDraftPaymentSectionProps {
  paymentSource: "free" | "payment";
  setPaymentSource: (v: "free" | "payment") => void;
  paymentMethodId: string;
  setPaymentMethodId: (v: string) => void;
  onGetSummary: () => void;
  isPending: boolean;
}

export function SenderDraftPaymentSection({
  paymentSource,
  setPaymentSource,
  paymentMethodId,
  setPaymentMethodId,
  onGetSummary,
  isPending,
}: SenderDraftPaymentSectionProps) {
  return (
    <div id="secPayment" className="border border-rcn-border/60 bg-white/95 rounded-[18px] p-3.5 shadow relative overflow-hidden border-l-4 border-l-rcn-brand scroll-mt-[120px]">
      <div className="-m-3.5 -mt-3.5 mb-3 p-3 border-b border-rcn-border/60 rounded-t-[18px] flex items-center justify-between" style={{ background: BOX_GRAD }}>
        <h4 className="m-0 text-[13px] font-semibold flex items-center gap-2.5">
          <span className="w-[30px] h-[30px] rounded-xl flex items-center justify-center border border-rcn-brand/25 bg-white/70 shadow">💳</span>
          Payment & Send Referral
        </h4>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-black border border-rcn-brand/25 bg-white/70 text-rcn-accent-dark">Draft</span>
      </div>
      <p className="text-rcn-muted text-xs font-[850] mb-3">Choose who pays for this referral. Receiver can pay to unlock (referral sent for free) or you can pay as sender.</p>
      <div className="space-y-3">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="radio"
            name="paymentSource"
            checked={paymentSource === "free"}
            onChange={() => setPaymentSource("free")}
            className="rounded-full border-rcn-border"
          />
          <span className="text-sm font-[850]">Receiver pays</span>
          <span className="text-rcn-muted text-xs">(Referral sent for free; receiver pays to unlock patient info)</span>
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="radio"
            name="paymentSource"
            checked={paymentSource === "payment"}
            onChange={() => setPaymentSource("payment")}
            className="rounded-full border-rcn-border"
          />
          <span className="text-sm font-[850]">Sender pays</span>
          <span className="text-rcn-muted text-xs">(You pay for the referral)</span>
        </label>
        {paymentSource === "payment" && (
          <div className="pl-6">
            <label className="block text-xs text-rcn-muted mb-1">Payment method ID</label>
            <input
              type="text"
              value={paymentMethodId}
              onChange={(e) => setPaymentMethodId(e.target.value)}
              placeholder="e.g. 69872818b7498eecd4b4e4af"
              className="w-full max-w-md px-2.5 py-2 text-sm rounded-xl border border-rcn-border bg-white focus:outline-none focus:ring-2 focus:ring-rcn-accent/30"
            />
          </div>
        )}
        <div className="pt-2">
          <button
            type="button"
            onClick={onGetSummary}
            disabled={isPending || (paymentSource === "payment" && !paymentMethodId.trim())}
            className="border border-rcn-brand/30 bg-rcn-brand/10 text-rcn-accent-dark px-4 py-2.5 rounded-xl font-extrabold text-sm shadow hover:bg-rcn-brand/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Loading…" : "Get payment summary & send referral"}
          </button>
        </div>
      </div>
    </div>
  );
}
