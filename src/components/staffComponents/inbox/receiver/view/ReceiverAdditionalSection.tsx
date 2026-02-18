"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { loadStripe } from "@stripe/stripe-js";
import Modal from "@/components/Modal";
import {
  getPaymentMethodsActiveApi,
  postOrganizationReferralDepartmentPaymentSummaryApi,
  postOrganizationReferralDepartmentPayApi,
} from "@/apis/ApiCalls";
import { checkResponse, catchAsync } from "@/utils/commonFunc";
import defaultQueryKeys from "@/utils/staffQueryKeys";
import { toastError } from "@/utils/toast";
import { BOX_GRAD } from "@/components/staffComponents/inbox/sender/view/senderViewHelpers";
import { Button, StripeCardModal } from "@/components";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

const SECTION_CLASS =
  "border border-rcn-border/60 bg-white/95 rounded-[18px] p-3.5 shadow-[0_12px_26px_rgba(2,6,23,.07)] relative overflow-hidden border-l-4 border-l-rcn-brand scroll-mt-[120px]";

const PAYMENT_METHODS_EXCLUDED_FROM_WEBSITE = ["apple_pay", "google_pay"];
const CARD_KEYS_REQUIRING_STRIPE = ["card"];

/** Payment summary for receiver department (mirrors sender summary shape). */
interface ReceiverPaymentSummaryData {
  referral_id?: string;
  total_departments?: number;
  total_recipients?: number;
  source?: string;
  amount?: number;
  currency?: string | null;
  breakdown?: { message?: string; [key: string]: unknown };
}

interface ReceiverAdditionalSectionProps {
  referralId: string;
  departmentId: string;
  isUnlocked: boolean;
  receiverStatus: string;
  addPatient: Record<string, string | undefined>;
  /** When true, sender already paid; show Accept instead of Pay & Unlock. */
  senderPaid?: boolean;
  onAccept: () => void;
  onPayUnlock: () => void;
  onReject: () => void;
}

export function ReceiverAdditionalSection({
  referralId,
  departmentId,
  isUnlocked,
  receiverStatus,
  addPatient,
  senderPaid = false,
  onAccept,
  onPayUnlock,
  onReject,
}: ReceiverAdditionalSectionProps) {
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [paySource, setPaySource] = useState<"credit" | "payment">("payment");
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [paymentSummary, setPaymentSummary] = useState<ReceiverPaymentSummaryData | null>(null);
  const [stripeModalOpen, setStripeModalOpen] = useState(false);
  /** When Stripe modal is for "get summary" vs "confirm pay". */
  const [stripeContext, setStripeContext] = useState<"for_summary" | "for_pay">("for_summary");

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
        .map((item) => ({ id: item.id, name: item.name, key: item.key }));
    },
    enabled: payModalOpen && paySource === "payment",
  });

  const paymentMethodOptions = Array.isArray(paymentMethodsList) ? paymentMethodsList : [];
  const selectedOption = paymentMethodOptions.find((pm) => pm.id === paymentMethodId);
  const selectedMethodKey = selectedOption?.key ?? null;
  const requiresStripeCard = selectedMethodKey != null && CARD_KEYS_REQUIRING_STRIPE.includes(selectedMethodKey);

  const { isPending: isSummaryPending, mutate: fetchPaymentSummary } = useMutation({
    mutationFn: catchAsync(async (overridePaymentMethodId?: string) => {
      const pmId = (overridePaymentMethodId ?? paymentMethodId).trim();
      if (!pmId) {
        throw new Error("Please select a payment method.");
      }
      const res = await postOrganizationReferralDepartmentPaymentSummaryApi(referralId, departmentId, {
        source: "payment",
        payment_method_id: pmId,
      });
      if (!checkResponse({ res, showSuccess: true })) return;
      const raw = res.data as { data?: ReceiverPaymentSummaryData };
      const payload = raw?.data ?? null;
      setPaymentSummary(payload && typeof payload === "object" ? payload : null);
      if (overridePaymentMethodId) setPaymentMethodId(overridePaymentMethodId);
      setSummaryModalOpen(true);
      queryClient.invalidateQueries({
        queryKey: [...defaultQueryKeys.referralReceivedList, "detail", referralId],
      });
    }),
  });

  const onCloseSummary = () => {
    setSummaryModalOpen(false);
    setPaymentSummary(null);
    setStripeModalOpen(false);
  };

  const onClosePayModal = () => {
    setPayModalOpen(false);
    setPaymentMethodId("");
    setPaySource("payment");
    onCloseSummary();
  };

  const { isPending: isPayPending, mutate: payUnlock } = useMutation({
    mutationFn: catchAsync(async (payload: { source: "credit" | "payment"; payment_method_id?: string }) => {
      const res = await postOrganizationReferralDepartmentPayApi(referralId, departmentId, payload);
      if (!checkResponse({ res, showSuccess: true })) return;
      const data = (res.data as { data?: { client_secret?: string } })?.data;
      const payment_method_id = payload.payment_method_id;
      if (payload.source === "payment" && requiresStripeCard && data?.client_secret && payment_method_id) {
        const stripe = await stripePromise;
        if (!stripe) {
          toastError("Stripe is not configured.");
          return;
        }
        const { error } = await stripe.confirmCardPayment(data.client_secret, {
          payment_method: payment_method_id,
        });
        if (error) {
          toastError(error.message ?? "Payment confirmation failed.");
          return;
        }
      }
      onClosePayModal();
      onPayUnlock();
      queryClient.invalidateQueries({
        queryKey: [...defaultQueryKeys.referralReceivedList, "detail", referralId],
      });
      queryClient.invalidateQueries({
        queryKey: defaultQueryKeys.referralReceivedList,
      });
    }),
  });

  const onConfirmPayFromSummary = () => {
    if (paySource === "credit") {
      payUnlock({ source: "credit" });
      return;
    }
    if (requiresStripeCard) {
      setStripeContext("for_pay");
      setStripeModalOpen(true);
      return;
    }
    payUnlock({
      source: "payment",
      payment_method_id: paymentMethodId.trim() || undefined,
    });
  };

  const onStripeCardSuccess = (stripePaymentMethodId: string) => {
    setStripeModalOpen(false);
    if (stripeContext === "for_summary") {
      fetchPaymentSummary(stripePaymentMethodId);
    } else {
      payUnlock({
        source: "payment",
        payment_method_id: stripePaymentMethodId,
      });
    }
  };

  const handleGetSummary = () => {
    if (paySource === "credit") {
      payUnlock({ source: "credit" });
      return;
    }
    if (!paymentMethodId.trim()) {
      toastError("Please select a payment method.");
      return;
    }
    if (requiresStripeCard) {
      setStripeContext("for_summary");
      setStripeModalOpen(true);
      return;
    }
    fetchPaymentSummary(undefined);
  };

  const rows: [string, string | undefined][] = [
    ["Phone Number (Must)", addPatient.phone_number],
    ["Primary Language", addPatient.primary_language],
    ["Representative / Power of Attorney", addPatient.power_of_attorney],
    ["Social Security Number", addPatient.social_security_number],
    ["Other Information", addPatient.other_information ?? "—"],
  ];

  return (
    <>
      <div id="secAdditional" className={SECTION_CLASS}>
        <div className="-m-3.5 -mt-3.5 mb-3 p-3 border-b border-rcn-border/60 rounded-t-[18px] flex items-center justify-between" style={{ background: BOX_GRAD }}>
          <h4 className="m-0 text-[13px] font-semibold flex items-center gap-2.5">
            <span className="w-[30px] h-[30px] rounded-xl flex items-center justify-center border border-rcn-brand/25 bg-white/70 shadow">🔒</span>
            Additional Patient Information
          </h4>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-black border border-rcn-brand/25 bg-white/70 text-rcn-accent-dark">
            {isUnlocked ? "Payment Completed — Visible" : "Visible Once Payment Is Completed"}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {rows.map(([label, val], i) => (
            <div key={label} className={i === 4 ? "sm:col-span-2" : ""}>
              <label className="block text-[11px] text-rcn-muted font-black mb-1">{label}</label>
              <div className="text-[13px] font-[850] text-rcn-text leading-tight p-2.5 border border-dashed border-slate-300/75 rounded-xl bg-slate-50/55">{val ?? "—"}</div>
            </div>
          ))}
        </div>
        {!isUnlocked && (
          <div className="absolute inset-0 rounded-[18px] bg-slate-900/45 flex items-center justify-center p-4">
            <div className="w-full max-w-[520px] rounded-2xl bg-white/95 border border-slate-200 shadow-[0_20px_50px_rgba(2,6,23,.25)] p-3.5">
              <h5 className="m-0 text-[13px] font-semibold">Locked: Additional Patient Information</h5>
              <p className="m-0 mt-1.5 mb-3 text-rcn-muted text-xs font-[850]">
                Chat is free. To view phone, SSN, and other sensitive fields, payment is required.
              </p>
              <div className="flex gap-2.5 flex-wrap justify-end">
                {senderPaid && (
                  <Button type="button" variant="primary" size="sm" onClick={onAccept}>
                    Accept (sender already paid)
                  </Button>
                )}
                {/* {receiverStatus === "ACCEPTED" && !senderPaid && ( */}
                  <Button type="button" variant="primary" size="sm" onClick={() => setPayModalOpen(true)}>
                    Pay & Unlock
                  </Button>
                {/* )} */}
                <Button type="button" variant="ghost" size="sm" onClick={onReject} className="border border-red-200 bg-red-50 text-red-700">
                  Reject
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pay & Unlock modal: choose credit or payment method, then get summary or pay with credits */}
      <Modal isOpen={payModalOpen} onClose={onClosePayModal} maxWidth="560px">
        <div className="p-4">
          <h3 className="m-0 text-base font-semibold mb-3 flex items-center gap-2.5">
            <span className="text-2xl">💳</span>
            Pay to Unlock
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
                onChange={() => setPaySource("credit")}
                className="rounded-full border-rcn-border"
              />
              <span className="text-sm font-[850]">Use organization credits</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="radio"
                name="paySource"
                checked={paySource === "payment"}
                onChange={() => setPaySource("payment")}
                className="rounded-full border-rcn-border"
              />
              <span className="text-sm font-[850]">Pay with card / payment method</span>
            </label>
            {paySource === "payment" && (
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
          </div>
          <div className="flex gap-2.5 justify-end mt-4">
            <Button type="button" variant="ghost" size="sm" onClick={onClosePayModal} className="border border-slate-200">
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={
                isSummaryPending ||
                isPayPending ||
                (paySource === "payment" && !paymentMethodId.trim())
              }
              onClick={paySource === "credit" ? () => payUnlock({ source: "credit" }) : handleGetSummary}
            >
              {paySource === "credit" ? (isPayPending ? "Processing…" : "Pay with credits") : isSummaryPending ? "Loading…" : "Get payment summary"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Payment summary modal (after "Get payment summary") */}
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
                {typeof paymentSummary.amount === "number" && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-rcn-muted text-xs font-black">Amount</span>
                    <p className="m-0 mt-0.5 font-[850]">
                      {paymentSummary.currency ? `${paymentSummary.currency} ` : ""}
                      {paymentSummary.amount}
                    </p>
                  </div>
                )}
              </div>
              {paymentSummary.breakdown?.message && (
                <div className="p-3 rounded-xl bg-rcn-brand/5 border border-rcn-brand/20">
                  <p className="m-0 text-[13px] font-[850] text-rcn-text">{paymentSummary.breakdown.message}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="m-0 text-rcn-muted text-sm">No summary data.</p>
          )}
          <div className="flex gap-2.5 justify-end mt-4">
            <Button type="button" variant="ghost" size="sm" onClick={onCloseSummary} className="border border-slate-200">
              Close
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={onConfirmPayFromSummary}
              disabled={isPayPending || !paymentSummary}
            >
              {isPayPending ? "Processing…" : "Confirm & pay"}
            </Button>
          </div>
        </div>
      </Modal>

      <StripeCardModal
        isOpen={stripeModalOpen}
        onClose={() => setStripeModalOpen(false)}
        onSuccess={onStripeCardSuccess}
        isSubmitting={isPayPending}
      />
    </>
  );
}
