"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toastError } from "@/utils/toast";
import {
  getAuthCreditsApi,
  getPaymentMethodsActiveApi,
  postWalletPurchaseCreditsSummaryApi,
  postWalletPurchaseCreditsApi,
} from "@/apis/ApiCalls";
import { checkResponse, catchAsync } from "@/utils/commonFunc";
import defaultQueryKeys from "@/utils/staffQueryKeys";
import Modal from "@/components/Modal";
import { Button, StripeCardModal } from "@/components";

const PAYMENT_METHODS_EXCLUDED_FROM_WEBSITE = ["apple_pay", "google_pay"];
const CARD_KEYS_REQUIRING_STRIPE = ["credit_card", "debit_card"];

/** Payment method option from GET /api/payment-methods/active */
interface PaymentMethodOption {
  id: string;
  name: string;
  key: string;
}

/** Purchase summary from POST /api/wallet/purchase-credits/summary */
interface PurchaseSummaryData {
  creditAmount?: number;
  creditPrice?: number;
  processingFee?: number;
  processingFeePercent?: number;
  baseAmount?: number;
  subtotal?: number;
  totalAmount?: number;
  currency?: string;
  payment_method_id?: string;
  payment_method_name?: string;
  threshold_applied?: boolean;
  breakdown?: {
    calculation?: string;
    message?: string;
  };
}

export default function WalletPage() {
  const queryClient = useQueryClient();
  const [creditAmount, setCreditAmount] = useState<string>("");
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [purchaseSummary, setPurchaseSummary] = useState<PurchaseSummaryData | null>(null);
  const [stripeModalOpen, setStripeModalOpen] = useState(false);
  /** When paying with card, we get this from Stripe and use it for summary + purchase */
  const [stripePaymentMethodId, setStripePaymentMethodId] = useState<string | null>(null);

  const { data: creditsData, isLoading: creditsLoading } = useQuery({
    queryKey: defaultQueryKeys.credits,
    queryFn: async () => {
      const res = await getAuthCreditsApi();
      if (!checkResponse({ res })) return { user_credits: 0, branch_credits: 0 };
      const raw = res.data as { data?: { user_credits?: number; branch_credits?: number } };
      const data = raw?.data;
      const user_credits = typeof data?.user_credits === "number" ? data.user_credits : 0;
      const branch_credits = typeof data?.branch_credits === "number" ? data.branch_credits : 0;
      return { user_credits, branch_credits };
    },
  });

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
  });

  const paymentMethodOptions: PaymentMethodOption[] = Array.isArray(paymentMethodsList) ? paymentMethodsList : [];
  const selectedOption = paymentMethodOptions.find((pm) => pm.id === paymentMethodId);
  const selectedMethodKey = selectedOption?.key ?? null;
  const requiresStripeCard = selectedMethodKey != null && CARD_KEYS_REQUIRING_STRIPE.includes(selectedMethodKey);

  const { isPending: isSummaryPending, mutate: fetchPurchaseSummary } = useMutation({
    mutationFn: catchAsync(async (overridePaymentMethodId?: string) => {
      const credits = parseInt(creditAmount, 10);
      if (!creditAmount || isNaN(credits) || credits <= 0) {
        toastError("Please enter a valid number of credits.");
        return;
      }
      const payment_method_id = overridePaymentMethodId ?? stripePaymentMethodId ?? (paymentMethodId.trim() || undefined);
      if (!payment_method_id) {
        toastError("Please select a payment method.");
        return;
      }
      const res = await postWalletPurchaseCreditsSummaryApi({ creditAmount: credits, payment_method_id });
      if (!checkResponse({ res })) return;
      const raw = res.data as { data?: PurchaseSummaryData };
      const payload = raw?.data ?? null;
      setPurchaseSummary(payload && typeof payload === "object" ? payload : null);
      setSummaryModalOpen(true);
    }),
  });

  const onCloseSummary = () => {
    setSummaryModalOpen(false);
    setPurchaseSummary(null);
    setStripeModalOpen(false);
    setStripePaymentMethodId(null);
  };

  const { isPending: isPurchasePending, mutate: purchaseCredits } = useMutation({
    mutationFn: catchAsync(async () => {
      const credits = parseInt(creditAmount, 10);
      if (!creditAmount || isNaN(credits) || credits <= 0) {
        toastError("Please enter a valid number of credits.");
        return;
      }
      const payment_method_id = stripePaymentMethodId ?? (paymentMethodId.trim() || undefined);
      if (!payment_method_id) {
        toastError("Please select a payment method.");
        return;
      }
      const res = await postWalletPurchaseCreditsApi({ creditAmount: credits, payment_method_id });
      if (!checkResponse({ res, showSuccess: true })) return;
      onCloseSummary();
      setCreditAmount("");
      queryClient.invalidateQueries({ queryKey: defaultQueryKeys.credits });
    }),
  });

  const handleGetSummaryOrStripe = () => {
    const credits = parseInt(creditAmount, 10);
    if (!creditAmount || isNaN(credits) || credits <= 0) {
      toastError("Please enter a valid number of credits.");
      return;
    }
    if (requiresStripeCard) {
      setStripeModalOpen(true);
      return;
    }
    if (!paymentMethodId.trim()) {
      toastError("Please select a payment method.");
      return;
    }
    fetchPurchaseSummary(undefined);
  };

  const onStripeCardSuccess = (paymentMethodIdFromStripe: string) => {
    setStripePaymentMethodId(paymentMethodIdFromStripe);
    setStripeModalOpen(false);
    fetchPurchaseSummary(paymentMethodIdFromStripe);
  };

  const handleConfirmPurchase = () => {
    const credits = parseInt(creditAmount, 10);
    if (!creditAmount || isNaN(credits) || credits <= 0) return;
    const payment_method_id = stripePaymentMethodId ?? (paymentMethodId.trim() || undefined);
    if (!payment_method_id) return;
    purchaseCredits();
  };

  const userCredits = typeof creditsData?.user_credits === "number" ? creditsData.user_credits : 0;
  const branchCredits = typeof creditsData?.branch_credits === "number" ? creditsData.branch_credits : 0;
  const totalCredits = userCredits + branchCredits;

  if (creditsLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-10">Loading wallet...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold m-0 mb-2">Wallet & Credits</h1>
        <p className="text-rcn-muted text-sm m-0">Purchase credits to send referrals and manage your account balance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_10px_30px_rgba(2,6,23,.07)] p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-rcn-muted uppercase tracking-wide">User Credits</span>
            <span className="text-2xl font-black text-rcn-accent-dark">{userCredits}</span>
          </div>
          <p className="text-xs text-rcn-muted m-0">Credits assigned to your account</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_10px_30px_rgba(2,6,23,.07)] p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-rcn-muted uppercase tracking-wide">Branch Credits</span>
            <span className="text-2xl font-black text-rcn-accent-dark">{branchCredits}</span>
          </div>
          <p className="text-xs text-rcn-muted m-0">Credits available at your branch</p>
        </div>
      </div>
      <div className="mb-6 p-3 rounded-xl bg-slate-50 border border-slate-200">
        <span className="text-xs font-black text-rcn-muted uppercase tracking-wide">Total available</span>
        <p className="m-0 mt-1 text-lg font-black text-rcn-accent-dark">{totalCredits} credits</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_10px_30px_rgba(2,6,23,.07)] p-6 mb-6">
        <h2 className="text-lg font-semibold m-0 mb-4">Purchase Credits</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-black text-rcn-muted mb-1.5">
              Number of Credits <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={creditAmount}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || (!isNaN(Number(value)) && Number(value) >= 0)) {
                  setCreditAmount(value);
                }
              }}
              placeholder="Enter number of credits"
              min="1"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white outline-none text-[13px] font-normal text-rcn-text focus:border-rcn-brand/30 focus:ring-2 focus:ring-rcn-brand/10"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-rcn-muted mb-1.5">Payment Method</label>
            <select
              value={paymentMethodId}
              onChange={(e) => {
                setPaymentMethodId(e.target.value);
                setStripePaymentMethodId(null);
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white outline-none text-[13px] font-normal text-rcn-text focus:border-rcn-brand/30 focus:ring-2 focus:ring-rcn-brand/10"
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

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleGetSummaryOrStripe}
            disabled={
              isSummaryPending ||
              !creditAmount ||
              isNaN(Number(creditAmount)) ||
              Number(creditAmount) <= 0 ||
              paymentMethodOptions.length === 0 ||
              (!requiresStripeCard && !paymentMethodId.trim())
            }
          >
            {isSummaryPending ? "Loading…" : "Get payment summary"}
          </Button>
        </div>
      </div>

      <Modal isOpen={summaryModalOpen} onClose={onCloseSummary} maxWidth="560px">
        <div className="p-4">
          <h3 className="m-0 text-base font-semibold mb-3 flex items-center gap-2.5">
            <span className="text-2xl">💳</span>
            Purchase Summary
          </h3>
          {purchaseSummary ? (
            <div className="text-sm text-rcn-text space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {typeof purchaseSummary.creditAmount === "number" && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-rcn-muted text-xs font-black">Credits</span>
                    <p className="m-0 mt-0.5 font-[850]">{purchaseSummary.creditAmount}</p>
                  </div>
                )}
                {purchaseSummary.payment_method_name && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-rcn-muted text-xs font-black">Payment method</span>
                    <p className="m-0 mt-0.5 font-[850]">{purchaseSummary.payment_method_name}</p>
                  </div>
                )}
                {typeof purchaseSummary.creditPrice === "number" && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-rcn-muted text-xs font-black">Price per credit</span>
                    <p className="m-0 mt-0.5 font-[850]">
                      {purchaseSummary.currency ?? "USD"} {purchaseSummary.creditPrice}
                    </p>
                  </div>
                )}
                {(purchaseSummary.processingFee != null && purchaseSummary.processingFee > 0) && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-rcn-muted text-xs font-black">Processing fee</span>
                    <p className="m-0 mt-0.5 font-[850]">
                      {purchaseSummary.currency ?? "USD"} {purchaseSummary.processingFee}
                      {typeof purchaseSummary.processingFeePercent === "number" && purchaseSummary.processingFeePercent > 0
                        ? ` (${purchaseSummary.processingFeePercent}%)`
                        : ""}
                    </p>
                  </div>
                )}
              </div>
              {purchaseSummary.breakdown?.calculation && (
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-rcn-muted text-xs font-black">Calculation</span>
                  <p className="m-0 mt-0.5 font-[850]">{purchaseSummary.breakdown.calculation}</p>
                </div>
              )}
              <div className="p-3 rounded-xl bg-rcn-brand/5 border border-rcn-brand/20">
                <div className="flex justify-between items-center">
                  <span className="text-rcn-muted text-xs font-black">Total</span>
                  <span className="text-base font-black text-rcn-accent-dark">
                    {purchaseSummary.currency ?? "USD"} {typeof purchaseSummary.totalAmount === "number" ? purchaseSummary.totalAmount : purchaseSummary.subtotal ?? "—"}
                  </span>
                </div>
                {purchaseSummary.breakdown?.message && (
                  <p className="m-0 mt-1 text-[13px] font-[850] text-rcn-text">{purchaseSummary.breakdown.message}</p>
                )}
              </div>
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
              onClick={handleConfirmPurchase}
              disabled={isPurchasePending || !purchaseSummary}
            >
              {isPurchasePending ? "Processing…" : "Confirm & purchase credits"}
            </Button>
          </div>
        </div>
      </Modal>

      <StripeCardModal
        isOpen={stripeModalOpen}
        onClose={() => {
          setStripeModalOpen(false);
          setStripePaymentMethodId(null);
        }}
        onSuccess={onStripeCardSuccess}
        isSubmitting={isSummaryPending}
        description="Enter your card details to purchase credits."
      />
    </div>
  );
}
