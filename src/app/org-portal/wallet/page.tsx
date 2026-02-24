"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { loadStripe } from "@stripe/stripe-js";
import { toastError, toastSuccess } from "@/utils/toast";
import {
  getAuthCreditsApi,
  getOrganizationBranchesApi,
  getPaymentMethodsActiveApi,
  postOrganizationBranchCreditsAssignApi,
  postWalletPurchaseCreditsApi,
  postWalletPurchaseCreditsSummaryApi,
} from "@/apis/ApiCalls";
import { checkResponse, catchAsync } from "@/utils/commonFunc";
import defaultQueryKeys from "@/utils/orgQueryKeys";
import Modal from "@/components/Modal";
import { Button, StripeCardModal } from "@/components";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

const PAYMENT_METHODS_EXCLUDED_FROM_WEBSITE = ["apple", "google"];
const CARD_KEYS_REQUIRING_STRIPE = ["card"];

interface PaymentMethodOption {
  id: string;
  name: string;
  key: string;
}

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

interface BranchOption {
  _id: string;
  name: string;
}

export default function OrgPortalWalletPage() {
  const queryClient = useQueryClient();
  const [creditAmount, setCreditAmount] = useState<string>("");
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [purchaseSummary, setPurchaseSummary] = useState<PurchaseSummaryData | null>(null);
  const [stripeModalOpen, setStripeModalOpen] = useState(false);
  const [stripePaymentMethodId, setStripePaymentMethodId] = useState<string | null>(null);
  const [assignBranchId, setAssignBranchId] = useState("");
  const [assignAmount, setAssignAmount] = useState<string>("");

  const { data: creditsData, isLoading: creditsLoading } = useQuery({
    queryKey: defaultQueryKeys.credits,
    queryFn: async () => {
      const res = await getAuthCreditsApi();
      if (!checkResponse({ res })) return { organization_credits: 0, branch_credits_summary: [] };
      const raw = res.data as {
        data?: {
          organization_credits?: number;
          branch_credits_summary?: Array<{
            branch_id: string;
            branch_name: string;
            credits_assigned?: number;
            credits_used?: number;
            credits_remaining?: number;
            remaining_credits?: number;
          }>;
        };
      };
      const data = raw?.data;
      const organization_credits = typeof data?.organization_credits === "number" ? data.organization_credits : 0;
      const branch_credits_summary = Array.isArray(data?.branch_credits_summary) ? data.branch_credits_summary : [];
      return { organization_credits, branch_credits_summary };
    },
  });

  const { data: branchesRes } = useQuery({
    queryKey: [...defaultQueryKeys.branchList, "wallet"],
    queryFn: async () => {
      const res = await getOrganizationBranchesApi({ search: "" });
      if (!checkResponse({ res })) return { data: [] };
      return res.data as { data?: BranchOption[] };
    },
  });

  const branches: BranchOption[] = Array.isArray(branchesRes?.data) ? branchesRes.data : [];

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

  const { isPending: isAssignPending, mutate: assignCredits } = useMutation({
    mutationFn: catchAsync(async () => {
      const amount = parseInt(assignAmount, 10);
      if (!assignBranchId.trim()) {
        toastError("Please select a branch.");
        return;
      }
      if (!assignAmount || isNaN(amount) || amount <= 0) {
        toastError("Please enter a valid amount.");
        return;
      }
      const res = await postOrganizationBranchCreditsAssignApi(assignBranchId, { amount });
      if (!checkResponse({ res, showSuccess: true })) return;
      setAssignBranchId("");
      setAssignAmount("");
      queryClient.invalidateQueries({ queryKey: defaultQueryKeys.credits });
    }),
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
      const data = (res.data as { data?: { clientSecret?: string }; message?: string })?.data;
      const hasClientSecret = Boolean(data?.clientSecret);

      if (!checkResponse({ res, showSuccess: !hasClientSecret })) return;

      if (requiresStripeCard && data?.clientSecret && payment_method_id) {
        const stripe = await stripePromise;
        if (!stripe) {
          toastError("Stripe is not configured.");
          return;
        }
        const { error } = await stripe.confirmCardPayment(data.clientSecret, {
          payment_method: payment_method_id,
        });
        if (error) {
          toastError(error.message ?? "Payment confirmation failed.");
          return;
        }
      }

      if (hasClientSecret) {
        toastSuccess(
          (res.data as { message?: string })?.message ??
            "Payment confirmed. Credits added. It may take a few minutes to appear in your account."
        );
      }
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

  const organizationCredits =
    typeof creditsData?.organization_credits === "number" ? creditsData.organization_credits : 0;
  const branchSummary = creditsData?.branch_credits_summary ?? [];

  if (creditsLoading) {
    return (
      <div>
        <div className="text-center py-10">Loading wallet...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold m-0 mb-2">Wallet & Credits</h1>
        <p className="text-rcn-muted text-sm m-0">Purchase credits for your organization.</p>
      </div>

      <div className="mb-6 max-w-md">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_10px_30px_rgba(2,6,23,.07)] p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-rcn-muted uppercase tracking-wide">Organization Credits</span>
            <span className="text-2xl font-black text-rcn-accent-dark">{organizationCredits}</span>
          </div>
          <p className="text-xs text-rcn-muted m-0">Credits available for your organization</p>
        </div>
      </div>

      {branchSummary.length > 0 && (
        <div className="mb-6 bg-white rounded-2xl border border-slate-200 shadow-[0_10px_30px_rgba(2,6,23,.07)] overflow-hidden">
          <h2 className="text-base font-semibold m-0 p-4 border-b border-slate-200">Credits by branch</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left p-3 font-semibold text-rcn-muted">Branch</th>
                  <th className="text-right p-3 font-semibold text-rcn-muted">Assigned</th>
                  <th className="text-right p-3 font-semibold text-rcn-muted">Used</th>
                  <th className="text-right p-3 font-semibold text-rcn-muted">Remaining</th>
                </tr>
              </thead>
              <tbody>
                {branchSummary.map((row) => (
                  <tr key={row.branch_id} className="border-b border-slate-100 last:border-0">
                    <td className="p-3 font-medium">{row.branch_name ?? "—"}</td>
                    <td className="p-3 text-right">{row.credits_assigned ?? 0}</td>
                    <td className="p-3 text-right">{row.credits_used ?? 0}</td>
                    <td className="p-3 text-right font-semibold">
                      {row.credits_remaining ?? row.remaining_credits ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_10px_30px_rgba(2,6,23,.07)] p-6 mb-6 max-w-2xl">
        <h2 className="text-lg font-semibold m-0 mb-4">Assign credits to branch</h2>
        <p className="text-sm text-rcn-muted m-0 mb-4">
          Assign organization credits to a branch. You must have available organization credits.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-black text-rcn-muted mb-1.5">Branch</label>
            <select
              value={assignBranchId}
              onChange={(e) => setAssignBranchId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white outline-none text-[13px] font-normal text-rcn-text focus:border-rcn-brand/30 focus:ring-2 focus:ring-rcn-brand/10"
              aria-label="Select branch"
            >
              <option value="">Select branch</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-black text-rcn-muted mb-1.5">Amount</label>
            <input
              type="number"
              value={assignAmount}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || (!isNaN(Number(value)) && Number(value) >= 0)) setAssignAmount(value);
              }}
              placeholder="Credits to assign"
              min="1"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white outline-none text-[13px] font-normal text-rcn-text focus:border-rcn-brand/30 focus:ring-2 focus:ring-rcn-brand/10"
              aria-label="Credits amount"
            />
          </div>
        </div>
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={() => assignCredits()}
          disabled={isAssignPending || !assignBranchId.trim() || !assignAmount || isNaN(Number(assignAmount)) || Number(assignAmount) <= 0}
        >
          {isAssignPending ? "Assigning…" : "Assign credits"}
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_10px_30px_rgba(2,6,23,.07)] p-6 mb-6 max-w-2xl">
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
                    <p className="m-0 mt-0.5 font-semibold">{purchaseSummary.creditAmount}</p>
                  </div>
                )}
                {purchaseSummary.payment_method_name && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-rcn-muted text-xs font-black">Payment method</span>
                    <p className="m-0 mt-0.5 font-semibold">{purchaseSummary.payment_method_name}</p>
                  </div>
                )}
                {typeof purchaseSummary.creditPrice === "number" && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-rcn-muted text-xs font-black">Price per credit</span>
                    <p className="m-0 mt-0.5 font-semibold">
                      {purchaseSummary.currency ?? "USD"} {purchaseSummary.creditPrice}
                    </p>
                  </div>
                )}
                {purchaseSummary.processingFee != null && purchaseSummary.processingFee > 0 && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-rcn-muted text-xs font-black">Processing fee</span>
                    <p className="m-0 mt-0.5 font-semibold">
                      {purchaseSummary.currency ?? "USD"} {purchaseSummary.processingFee}
                      {typeof purchaseSummary.processingFeePercent === "number" &&
                      purchaseSummary.processingFeePercent > 0
                        ? ` (${purchaseSummary.processingFeePercent}%)`
                        : ""}
                    </p>
                  </div>
                )}
              </div>
              {purchaseSummary.breakdown?.calculation && (
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-rcn-muted text-xs font-black">Calculation</span>
                  <p className="m-0 mt-0.5 font-semibold">{purchaseSummary.breakdown.calculation}</p>
                </div>
              )}
              <div className="p-3 rounded-xl bg-rcn-brand/5 border border-rcn-brand/20">
                <div className="flex justify-between items-center">
                  <span className="text-rcn-muted text-xs font-black">Total</span>
                  <span className="text-base font-black text-rcn-accent-dark">
                    {purchaseSummary.currency ?? "USD"}{" "}
                    {typeof purchaseSummary.totalAmount === "number"
                      ? purchaseSummary.totalAmount
                      : purchaseSummary.subtotal ?? "—"}
                  </span>
                </div>
                {purchaseSummary.breakdown?.message && (
                  <p className="m-0 mt-1 text-[13px] font-semibold text-rcn-text">
                    {purchaseSummary.breakdown.message}
                  </p>
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
