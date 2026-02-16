"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Modal from "@/components/Modal";
import {
  getPaymentMethodsActiveApi,
  postOrganizationReferralPaymentSummaryApi,
  postOrganizationReferralSendApi,
} from "@/apis/ApiCalls";
import { checkResponse, catchAsync } from "@/utils/commonFunc";
import defaultQueryKeys from "@/utils/staffQueryKeys";
import { BOX_GRAD, type PaymentSummaryData } from "./senderViewHelpers";
import { Button, StripeCardModal } from "@/components";

/** Active payment method from GET /api/payment-methods/active. */
export interface PaymentMethodOption {
  id: string;
  name: string;
  key: string;
}

const PAYMENT_METHODS_EXCLUDED_FROM_WEBSITE = ["apple_pay", "google_pay"];
const CARD_KEYS_REQUIRING_STRIPE = ["credit_card", "debit_card"];

interface SenderDraftPaymentSectionProps {
  refId: string;
}

export function SenderDraftPaymentSection({ refId }: SenderDraftPaymentSectionProps) {
  const [paymentSource, setPaymentSource] = useState<"free" | "payment" | "credit">("free");
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummaryData | null>(null);
  const [stripeModalOpen, setStripeModalOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: paymentMethodsList } = useQuery({
    queryKey: defaultQueryKeys.paymentMethodsActive,
    queryFn: async () => {
      const res = await getPaymentMethodsActiveApi();
      if (!checkResponse({ res })) return [];
      const raw = res.data as { success?: boolean; data?: { id: string; name: string; key: string }[] };
      const list = Array.isArray(raw?.data) ? raw.data : [];
      return list
        .filter((item) => !PAYMENT_METHODS_EXCLUDED_FROM_WEBSITE.includes(item.key))
        .map((item) => ({
          id: item.id,
          name: item.name,
          key: item.key,
        }));
    },
    enabled: paymentSource === "payment",
  });

  const paymentMethodOptions = Array.isArray(paymentMethodsList) ? paymentMethodsList : [];
  const selectedOption = paymentMethodOptions.find((pm) => pm.id === paymentMethodId);
  const selectedMethodKey = selectedOption?.key ?? null;
  const requiresStripeCard = selectedMethodKey != null && CARD_KEYS_REQUIRING_STRIPE.includes(selectedMethodKey);
  
  const { isPending: isPaymentSummaryPending, mutate: fetchPaymentSummary } = useMutation({
    mutationFn: catchAsync(async () => {
      const body =
        paymentSource === "free"
          ? { source: "free" as const }
          : { source: "payment" as const, payment_method_id: paymentMethodId.trim() || undefined };
      if (paymentSource === "payment" && !paymentMethodId.trim()) {
        throw new Error("Payment method is required when sender pays.");
      }
      const res = await postOrganizationReferralPaymentSummaryApi(refId, body);
      if (!checkResponse({ res, showSuccess: true })) return;
      const raw = res.data as { data?: PaymentSummaryData };
      const payload = raw?.data ?? null;
      setPaymentSummary(
        payload && typeof payload === "object" ? (payload as PaymentSummaryData) : null
      );
      setSummaryModalOpen(true);
      queryClient.invalidateQueries({
        queryKey: [...defaultQueryKeys.referralSentList, "detail", refId],
      });
    }),
  });

  const onCloseSummary = () => {
    setSummaryModalOpen(false);
    setPaymentSummary(null);
    setStripeModalOpen(false);
  };

  const { isPending: isSendPending, mutate: sendReferral } = useMutation({
    mutationFn: catchAsync(async (payload: { source: "free" | "payment"; payment_method_id?: string }) => {
      const res = await postOrganizationReferralSendApi(refId, payload);
      if (!checkResponse({ res, showSuccess: true })) return;
      onCloseSummary();
      queryClient.invalidateQueries({
        queryKey: [...defaultQueryKeys.referralSentList, "detail", refId],
      });
      queryClient.invalidateQueries({
        queryKey: defaultQueryKeys.referralSentList,
      });
    }),
  });

  const onConfirmAndSend = () => {
    if (paymentSource === "free") {
      sendReferral({ source: "free" });
      return;
    }
    if (paymentSource === "payment") {
      if (requiresStripeCard) {
        setStripeModalOpen(true);
        return;
      }
      sendReferral({
        source: "payment",
        payment_method_id: paymentMethodId.trim() || undefined,
      });
    }
  };

  const onStripeCardSuccess = (stripePaymentMethodId: string) => {
    setStripeModalOpen(false);
    sendReferral({
      source: "payment",
      payment_method_id: stripePaymentMethodId,
    });
  };

  return (
    <>
      <div
        id="secPayment"
        className="border border-rcn-border/60 bg-white/95 rounded-[18px] p-3.5 shadow relative overflow-hidden border-l-4 border-l-rcn-brand scroll-mt-[120px]"
      >
        <div
          className="-m-3.5 -mt-3.5 mb-3 p-3 border-b border-rcn-border/60 rounded-t-[18px] flex items-center justify-between"
          style={{ background: BOX_GRAD }}
        >
          <h4 className="m-0 text-[13px] font-semibold flex items-center gap-2.5">
            <span className="w-[30px] h-[30px] rounded-xl flex items-center justify-center border border-rcn-brand/25 bg-white/70 shadow">
              💳
            </span>
            Payment & Send Referral
          </h4>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-black border border-rcn-brand/25 bg-white/70 text-rcn-accent-dark">
            Draft
          </span>
        </div>
        <p className="text-rcn-muted text-xs font-[850] mb-3">
          Choose who pays for this referral. Receiver can pay to unlock (referral sent for free) or
          you can pay as sender.
        </p>
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
            <span className="text-rcn-muted text-xs">
              (Referral sent for free; receiver pays to unlock patient info)
            </span>
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
              <label className="block text-xs text-rcn-muted mb-1">Payment method</label>
              <select
                value={paymentMethodId}
                onChange={(e) => setPaymentMethodId(e.target.value)}
                className="w-full max-w-md px-2.5 py-2 text-sm rounded-xl border border-rcn-border bg-white focus:outline-none focus:ring-2 focus:ring-rcn-accent/30"
                aria-label="Select payment method"
              >
                <option value="">Select payment method</option>
                {paymentMethodOptions.map((pm) => (
                  <option key={pm.id} value={pm.id}>
                    {pm.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => fetchPaymentSummary()}
              disabled={
                isPaymentSummaryPending ||
                (paymentSource === "payment" && !paymentMethodId.trim())
              }
              className="border border-rcn-brand/30 bg-rcn-brand/10 text-rcn-accent-dark px-4 py-2.5 rounded-xl font-extrabold text-sm shadow hover:bg-rcn-brand/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPaymentSummaryPending ? "Loading…" : "Get payment summary & send referral"}
            </button>
          </div>
        </div>
      </div>

      <Modal isOpen={summaryModalOpen} onClose={onCloseSummary} maxWidth="560px">
        <div className="p-4">
          <h3 className="m-0 text-base font-semibold mb-3 flex items-center gap-2.5">
            <span className="text-2xl">💳</span>
            Payment Summary
          </h3>
          {paymentSummary ? (
            <div className="text-sm text-rcn-text space-y-3">
              {paymentSummary.referral_id && (
                <div>
                  <span className="text-rcn-muted text-xs font-black">Referral ID</span>
                  <p className="m-0 mt-0.5 font-[850]">{paymentSummary.referral_id}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                {typeof paymentSummary.total_recipients === "number" && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-rcn-muted text-xs font-black">Recipients</span>
                    <p className="m-0 mt-0.5 font-[850]">{paymentSummary.total_recipients}</p>
                  </div>
                )}
                {typeof paymentSummary.total_departments === "number" && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-rcn-muted text-xs font-black">Departments</span>
                    <p className="m-0 mt-0.5 font-[850]">{paymentSummary.total_departments}</p>
                  </div>
                )}
                {paymentSummary.source != null && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-rcn-muted text-xs font-black">Payment by</span>
                    <p className="m-0 mt-0.5 font-[850]">
                      {paymentSummary.source === "free" ? "Receiver pays" : "Sender pays"}
                    </p>
                  </div>
                )}
                {(paymentSummary.amount != null || paymentSummary.currency) && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-rcn-muted text-xs font-black">Amount</span>
                    <p className="m-0 mt-0.5 font-[850]">
                      {paymentSummary.currency ? `${paymentSummary.currency} ` : ""}
                      {typeof paymentSummary.amount === "number"
                        ? paymentSummary.amount
                        : "—"}
                    </p>
                  </div>
                )}
              </div>
              {paymentSummary.breakdown?.message && (
                <div className="p-3 rounded-xl bg-rcn-brand/5 border border-rcn-brand/20">
                  <p className="m-0 text-[13px] font-[850] text-rcn-text">
                    {paymentSummary.breakdown.message}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="m-0 text-rcn-muted text-sm">No summary data.</p>
          )}
          <div className="flex gap-2.5 justify-end mt-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCloseSummary}
              className="border border-slate-200"
            >
              Close
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={onConfirmAndSend}
              disabled={isSendPending || !paymentSummary}
            >
              {isSendPending ? "Sending…" : "Confirm & send referral"}
            </Button>
          </div>
        </div>
      </Modal>

      <StripeCardModal
        isOpen={stripeModalOpen}
        onClose={() => setStripeModalOpen(false)}
        onSuccess={onStripeCardSuccess}
        isSubmitting={isSendPending}
      />
    </>
  );
}
