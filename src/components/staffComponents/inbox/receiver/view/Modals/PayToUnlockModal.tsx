"use client";

import React from "react";
import Modal from "@/components/Modal";
import { Button } from "@/components";

export interface PaymentMethodOption {
  id: string;
  name: string;
  key: string;
}

interface PayToUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  paySource: "credit" | "payment";
  onPaySourceChange: (source: "credit" | "payment") => void;
  paymentMethodId: string;
  onPaymentMethodChange: (id: string) => void;
  methods: PaymentMethodOption[];
  busy: boolean;
  payLoading: boolean;
  summaryLoading: boolean;
  onAction: () => void;
}

export function PayToUnlockModal({
  isOpen,
  onClose,
  paySource,
  onPaySourceChange,
  paymentMethodId,
  onPaymentMethodChange,
  methods,
  busy,
  payLoading,
  summaryLoading,
  onAction,
}: PayToUnlockModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="560px">
      <div className="p-4">
        <h3 className="m-0 text-base font-semibold mb-3 flex items-center gap-2.5">
          <span className="text-2xl">💳</span> Pay to Unlock
        </h3>
        <p className="m-0 mb-4 text-rcn-muted text-xs font-[850]">
          Pay with organization credits or a payment method to unlock additional patient information.
        </p>
        <div className="space-y-3">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="radio"
              name="paySource"
              checked={paySource === "credit"}
              onChange={() => onPaySourceChange("credit")}
              className="rounded-full border-rcn-border"
            />
            <span className="text-sm font-[850]">Use organization credits</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="radio"
              name="paySource"
              checked={paySource === "payment"}
              onChange={() => onPaySourceChange("payment")}
              className="rounded-full border-rcn-border"
            />
            <span className="text-sm font-[850]">Pay with card / payment method</span>
          </label>
          {paySource === "payment" && (
            <div className="pl-6">
              <label className="block text-xs text-rcn-muted mb-1">Payment method</label>
              <select
                value={paymentMethodId}
                onChange={(e) => onPaymentMethodChange(e.target.value)}
                className="w-full max-w-md px-2.5 py-2 text-sm rounded-xl border border-rcn-border bg-white focus:outline-none focus:ring-2 focus:ring-rcn-accent/30"
                aria-label="Select payment method"
              >
                <option value="">Select payment method</option>
                {methods.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="flex gap-2.5 justify-end mt-4">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} className="border border-slate-200">
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={busy || (paySource === "payment" && !paymentMethodId.trim())}
            onClick={onAction}
          >
            {paySource === "credit"
              ? payLoading
                ? "Processing…"
                : "Pay with credits"
              : summaryLoading
                ? "Loading…"
                : "Get payment summary"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
