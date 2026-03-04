"use client";

import React from "react";
import Modal from "@/components/Modal";
import { Button } from "@/components";

export interface CreditBalanceItem {
  source: "user" | "branch";
  id: string;
  name: string;
  balance: number;
}

export interface PaymentSummaryData {
  referral_id?: string;
  amount?: number;
  currency?: string | null;
  source?: string;
  breakdown?: {
    message?: string;
    calculation?: string;
    price_per_referral?: number;
    processing_fee_per_referral?: number;
    processing_fee_percent?: number;
    total_amount?: number;
    payment_method_name?: string;
    credit_balance_details?: CreditBalanceItem[];
  };
}

interface PaymentSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: PaymentSummaryData | null;
  payLoading: boolean;
  /** For credit flow: selected source (user or branch). */
  selectedCreditSource: CreditBalanceItem | null;
  onCreditSourceChange: (item: CreditBalanceItem | null) => void;
  /** Called when user confirms and summary is for credit (use selectedCreditSource). */
  onConfirmCredit: (source: CreditBalanceItem) => void;
  /** Called when user confirms and summary is for payment (then open Stripe etc). */
  onConfirm: () => void;
}

export function PaymentSummaryModal({
  isOpen,
  onClose,
  summary,
  payLoading,
  selectedCreditSource,
  onCreditSourceChange,
  onConfirmCredit,
  onConfirm,
}: PaymentSummaryModalProps) {
  const isCreditFlow =
    summary?.source === "credit" &&
    Array.isArray(summary?.breakdown?.credit_balance_details) &&
    summary.breakdown.credit_balance_details.length > 0;

  const handleConfirm = () => {
    if (isCreditFlow && selectedCreditSource) {
      onConfirmCredit(selectedCreditSource);
    } else {
      onConfirm();
    }
  };

  const confirmDisabled =
    payLoading ||
    !summary ||
    (isCreditFlow && !selectedCreditSource);

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="560px">
      <div className="p-4">
        <h3 className="m-0 text-base font-semibold mb-3 flex items-center gap-2.5">
          <span className="text-2xl">💳</span> Payment Summary
        </h3>
        {summary ? (
          <div className="text-sm text-rcn-text space-y-3">
            {summary.referral_id && (
              <div>
                <span className="text-rcn-muted text-xs font-black">Referral ID</span>
                <p className="m-0 mt-0.5 font-[850]">{summary.referral_id}</p>
              </div>
            )}
            {summary.source === "credit" && (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-rcn-muted text-xs font-black">Payment by</span>
                <p className="m-0 mt-0.5 font-[850]">Use credits</p>
              </div>
            )}
            {(summary.amount != null || summary.currency) && (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-rcn-muted text-xs font-black">Amount</span>
                <p className="m-0 mt-0.5 font-[850]">
                  {summary.currency ? `${summary.currency} ` : ""}
                  {summary.amount ?? "—"}
                </p>
              </div>
            )}
            {isCreditFlow && summary?.breakdown?.credit_balance_details?.length && (
              <div>
                <label className="block text-xs font-black text-rcn-muted mb-1.5">
                  Deduct credits from
                </label>
                <select
                  value={
                    selectedCreditSource
                      ? `${selectedCreditSource.source}:${selectedCreditSource.id}`
                      : ""
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    const item = summary.breakdown!.credit_balance_details!.find(
                      (d) => `${d.source}:${d.id}` === val,
                    );
                    onCreditSourceChange(item ?? null);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-rcn-text focus:outline-none focus:ring-2 focus:ring-rcn-brand/20"
                  aria-label="Credit source"
                >
                  {summary?.breakdown?.credit_balance_details.map((d) => (
                    <option key={`${d.source}:${d.id}`} value={`${d.source}:${d.id}`}>
                      {d.name} ({d.balance} credits)
                    </option>
                  ))}
                </select>
              </div>
            )}
            {(summary.breakdown?.processing_fee_per_referral != null) && (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-rcn-muted text-xs font-black">Processing fee</span>
                <p className="m-0 mt-0.5 font-[850]">
                  {summary.currency ?? "USD"}{" "}
                  {typeof summary.breakdown.processing_fee_per_referral === "number"
                    ? summary.breakdown.processing_fee_per_referral
                    : "0"}
                </p>
              </div>
            )}
            {summary.breakdown?.message && (
              <div className="p-3 rounded-xl bg-rcn-brand/5 border border-rcn-brand/20">
                <p className="m-0 text-[13px] font-[850] text-rcn-text">
                  {summary.breakdown.message}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="m-0 text-rcn-muted text-sm">No summary data.</p>
        )}
        <div className="flex gap-2.5 justify-end mt-4">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} className="border border-slate-200">
            Close
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleConfirm}
            disabled={confirmDisabled}
          >
            {payLoading ? "Processing…" : "Confirm & pay"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
