"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { loadStripe } from "@stripe/stripe-js";
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
import { PayToUnlockModal, PaymentSummaryModal } from "@/components/staffComponents/inbox/receiver/view/Modals";
import type { PaymentSummaryData } from "@/components/staffComponents/inbox/receiver/view/Modals";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

const SECTION_CLASS =
  "border border-rcn-border/60 bg-white/95 rounded-[18px] p-3.5 shadow-[0_12px_26px_rgba(2,6,23,.07)] relative overflow-hidden border-l-4 border-l-rcn-brand scroll-mt-[120px]";

const EXCLUDED_PAYMENT_KEYS = ["apple_pay", "google_pay"];
const CARD_KEY = "card";

interface ReceiverAdditionalSectionProps {
  referralId: string;
  departmentId: string;
  isUnlocked: boolean;
  receiverStatus: string;
  addPatient: Record<string, string | undefined>;
  senderPaid?: boolean;
  onAccept: () => void;
  onPayUnlock: () => void;
  onReject: () => void;
}

const ADDITIONAL_ROWS: [string, string][] = [
  ["Phone Number (Must)", "phone_number"],
  ["Primary Language", "primary_language"],
  ["Representative / Power of Attorney", "power_of_attorney"],
  ["Social Security Number", "social_security_number"],
  ["Other Information", "other_information"],
];

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
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState("");
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summary, setSummary] = useState<PaymentSummaryData | null>(null);
  const [stripeOpen, setStripeOpen] = useState(false);
  const [stripePmId, setStripePmId] = useState("");

  const queryClient = useQueryClient();

  const { data: methodsList } = useQuery({
    queryKey: defaultQueryKeys.paymentMethodsActive,
    queryFn: async () => {
      const res = await getPaymentMethodsActiveApi();
      if (!checkResponse({ res })) return [];
      const raw = res.data as { data?: { id: string; name: string; key: string }[] };
      const list = Array.isArray(raw?.data) ? raw.data : [];
      return list
        .filter((m) => !EXCLUDED_PAYMENT_KEYS.includes(m.key))
        .map((m) => ({ id: m.id, name: m.name, key: m.key }));
    },
    enabled: payModalOpen && paySource === "payment",
  });

  const methods = Array.isArray(methodsList) ? methodsList : [];
  const selectedMethod = methods.find((m) => m.id === selectedPaymentMethodId);
  const isCard = selectedMethod?.key === CARD_KEY;

  const closeAll = () => {
    setPayModalOpen(false);
    setSummaryOpen(false);
    setStripeOpen(false);
    setSelectedPaymentMethodId("");
    setPaySource("payment");
    setSummary(null);
  };

  const { isPending: summaryLoading, mutate: getSummary } = useMutation({
    mutationFn: catchAsync(async (pmIdOverride: string) => {
      const pmId = pmIdOverride

      const res = await postOrganizationReferralDepartmentPaymentSummaryApi(referralId, departmentId, {
        source: "payment",
        payment_method_id: pmId,
      });
      if (!checkResponse({ res, showSuccess: true })) return;
      const raw = res.data as { data?: PaymentSummaryData };
      setSummary(raw?.data ?? null);
      setStripePmId(pmId);
      setSummaryOpen(true);
    }),
  });

  const { isPending: payLoading, mutate: pay } = useMutation({
    mutationFn: catchAsync(async (payload: { source: "credit" | "payment"; payment_method_id?: string }) => {
      const res = await postOrganizationReferralDepartmentPayApi(referralId, departmentId, payload);
      const needsStripe = payload.source === "payment" && isCard && payload.payment_method_id;
      if (!checkResponse({ res, showSuccess: !needsStripe })) return;

      const resData = (res.data as { data?: { client_secret?: string } })?.data;
      if (needsStripe && resData?.client_secret && payload.payment_method_id) {
        const stripe = await stripePromise;
        if (!stripe) {
          toastError("Stripe is not configured.");
          return;
        }
        const { error } = await stripe.confirmCardPayment(resData.client_secret, {
          payment_method: payload.payment_method_id,
        });
        if (error) {
          toastError(error.message ?? "Payment confirmation failed.");
          return;
        }
      }

      closeAll();
      onPayUnlock();
      queryClient.invalidateQueries({ queryKey: [...defaultQueryKeys.referralReceivedList, "detail", referralId] });
      queryClient.invalidateQueries({ queryKey: defaultQueryKeys.referralReceivedList });
    }),
  });

  const onPayModalAction = () => {
    if (paySource === "credit") {
      pay({ source: "credit" });
      return;
    }
    if (!selectedPaymentMethodId.trim()) {
      toastError("Please select a payment method.");
      return;
    }
    if (isCard) {
      setStripeOpen(true);
      return;
    }

  };

  const onSummaryConfirm = () => {
    pay({ source: "payment", payment_method_id: stripePmId });
  };

  const onStripeDone = (stripePmId: string) => {
    setStripeOpen(false);
    getSummary(stripePmId);
  };

  const busy = summaryLoading || payLoading;
  const showPayButton = receiverStatus === "ACCEPTED" && !senderPaid;
  const closeSummary = () => {
    setSummaryOpen(false);
    setSummary(null);
    setStripeOpen(false);
  };

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
          {ADDITIONAL_ROWS.map(([label, key], i) => (
            <div key={key} className={i === 4 ? "sm:col-span-2" : ""}>
              <label className="block text-[11px] text-rcn-muted font-black mb-1">{label}</label>
              <div className="text-[13px] font-[850] text-rcn-text leading-tight p-2.5 border border-dashed border-slate-300/75 rounded-xl bg-slate-50/55">
                {addPatient[key] ?? "—"}
              </div>
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
                {/* {showPayButton && ( */}
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

      <PayToUnlockModal
        isOpen={payModalOpen}
        onClose={closeAll}
        paySource={paySource}
        onPaySourceChange={setPaySource}
        paymentMethodId={selectedPaymentMethodId}
        onPaymentMethodChange={setSelectedPaymentMethodId}
        methods={methods}
        busy={busy}
        payLoading={payLoading}
        summaryLoading={summaryLoading}
        onAction={onPayModalAction}
      />

      <PaymentSummaryModal
        isOpen={summaryOpen}
        onClose={closeSummary}
        summary={summary}
        payLoading={payLoading}
        onConfirm={onSummaryConfirm}
      />

      <StripeCardModal isOpen={stripeOpen} onClose={() => setStripeOpen(false)} onSuccess={onStripeDone} isSubmitting={payLoading} />
    </>
  );
}
