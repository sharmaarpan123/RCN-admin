"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { getDB, saveDB, nowISO, audit, moneyToCents, ensureOrgMoney, postLedger, ensureFinance } from "@/utils/database";

// Pricing: 5 credits = $10, so 1 credit = $2
const CREDIT_PRICE = 2.00;

interface CardDetails {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  nameOnCard: string;
  zipCode: string;
}

export default function WalletPage() {
  const { session, db, refreshDB, showToast } = useApp();
  const [creditAmount, setCreditAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("creditCard");
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [org, setOrg] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    nameOnCard: "",
    zipCode: "",
  });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (session?.orgId) {
      const database = getDB();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const organization = database.orgs.find((o: any) => o.id === session.orgId);
      if (organization) {
        ensureOrgMoney(organization);
        setOrg(organization);
      }
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [session, db]);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardDetails((prev) => ({ ...prev, cardNumber: formatted }));
  };

  const calculatePrice = (credits: number): number => {
    return credits * CREDIT_PRICE;
  };

  const handleOpenPaymentModal = () => {
    const credits = parseInt(creditAmount, 10);
    if (!creditAmount || isNaN(credits) || credits <= 0) {
      showToast("Please enter a valid number of credits.");
      return;
    }
    if (paymentMethod === "creditCard" || paymentMethod === "debitCard") {
      setShowPaymentModal(true);
    } else {
      // For other payment methods, proceed directly
      handlePurchase();
    }
  };

  const handlePurchase = () => {
    const credits = parseInt(creditAmount, 10);
    if (!creditAmount || isNaN(credits) || credits <= 0 || !session?.orgId) {
      showToast("Please enter a valid number of credits.");
      return;
    }

    // Validate card details if using card payment
    if ((paymentMethod === "creditCard" || paymentMethod === "debitCard") && showPaymentModal) {
      if (!cardDetails.cardNumber.replace(/\s/g, "") || cardDetails.cardNumber.replace(/\s/g, "").length < 13) {
        showToast("Please enter a valid card number.");
        return;
      }
      if (!cardDetails.expiryMonth || !cardDetails.expiryYear) {
        showToast("Please enter card expiry date.");
        return;
      }
      if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
        showToast("Please enter a valid CVV.");
        return;
      }
      if (!cardDetails.nameOnCard.trim()) {
        showToast("Please enter name on card.");
        return;
      }
      if (!cardDetails.zipCode.trim()) {
        showToast("Please enter zip code.");
        return;
      }
    }

    setProcessing(true);

    const database = getDB();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const organization = database.orgs.find((o: any) => o.id === session.orgId);
    if (!organization) {
      showToast("Organization not found.");
      return;
    }

    ensureOrgMoney(organization);

    // Calculate total credits and price
    const totalCredits = credits;
    const price = calculatePrice(credits);
    const priceCents = moneyToCents(price);

    // Add credits to organization
    organization.referralCredits = (organization.referralCredits || 0) + totalCredits;

    // Ensure finance structure exists
    ensureFinance(database);

    // Record transaction in ledger
    postLedger(database, {
      id: `ldg_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      at: nowISO(),
      orgId: session.orgId,
      deltaCents: 0, // No wallet change, just credits
      type: "credit_purchase",
      paymentMethod,
      credits: totalCredits,
      priceCents,
      note: `Purchased ${totalCredits} credits via ${paymentMethod} - $${price.toFixed(2)}`,
    });

    saveDB(database);
    refreshDB();
    audit("credit_purchase", { 
      orgId: session.orgId, 
      credits: totalCredits, 
      priceCents,
      paymentMethod 
    });

    showToast(`Successfully purchased ${totalCredits} credits!`);
    setCreditAmount("");
    setShowPaymentModal(false);
    setCardDetails({
      cardNumber: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
      nameOnCard: "",
      zipCode: "",
    });
    setProcessing(false);
    
    // Refresh data
    setTimeout(() => {
      const updatedDb = getDB();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updatedOrg = updatedDb.orgs.find((o: any) => o.id === session.orgId);
      if (updatedOrg) {
        setOrg(updatedOrg);
      }
    }, 100);
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      creditCard: "Credit Card",
      debitCard: "Debit Card",
      applePay: "Apple Pay",
      paypal: "PayPal",
      googlePay: "Google Pay",
      bankTransfer: "Bank Transfer",
      ach: "ACH",
    };
    return labels[method] || method;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-10">Loading wallet...</div>
      </div>
    );
  }

  if (!session?.orgId) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-10">
          <h2 className="text-lg font-semibold mb-2">No Organization Found</h2>
          <p className="text-rcn-muted">You must be associated with an organization to access the wallet.</p>
        </div>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-10">
          <h2 className="text-lg font-semibold mb-2">Organization Not Found</h2>
          <p className="text-rcn-muted">Unable to load organization data.</p>
        </div>
      </div>
    );
  }

  const credits = org.referralCredits || 0;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold m-0 mb-2">Wallet & Credits</h1>
        <p className="text-rcn-muted text-sm m-0">Purchase credits to send referrals and manage your account balance.</p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
       
        <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_10px_30px_rgba(2,6,23,.07)] p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-rcn-muted uppercase tracking-wide">Referral Credits</span>
            <span className="text-2xl font-black text-rcn-accent-dark">{credits}</span>
          </div>
          <p className="text-xs text-rcn-muted m-0">Credits available for sending referrals</p>
        </div>
      </div>

      {/* Purchase Credits Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_10px_30px_rgba(2,6,23,.07)] p-6 mb-6">
        <h2 className="text-lg font-semibold m-0 mb-4">Purchase Credits</h2>
        
        <div className="space-y-4">
          {/* Credit Amount Input */}
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
            <p className="text-xs text-rcn-muted mt-1.5">Price: $2.00 per credit (5 credits = $10.00)</p>
          </div>

          {/* Payment Method and Total */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-rcn-muted mb-1.5">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white outline-none text-[13px] font-normal text-rcn-text focus:border-rcn-brand/30 focus:ring-2 focus:ring-rcn-brand/10"
              >
                <option value="creditCard">Credit Card</option>
                <option value="debitCard">Debit Card</option>
                <option value="applePay">Apple Pay</option>
                <option value="paypal">PayPal</option>
                <option value="googlePay">Google Pay</option>
                <option value="bankTransfer">Bank Transfer</option>
                <option value="ach">ACH</option>
              </select>
            </div>
            <div className="flex items-end">
              <div className="w-full">
                <div className="text-xs font-black text-rcn-muted mb-1.5">Total</div>
                <div className="text-2xl font-black text-rcn-accent-dark">
                  ${creditAmount && !isNaN(Number(creditAmount)) && Number(creditAmount) > 0
                    ? calculatePrice(Number(creditAmount)).toFixed(2)
                    : "0.00"}
                </div>
                <div className="text-xs text-rcn-muted mt-1">
                  {creditAmount && !isNaN(Number(creditAmount)) && Number(creditAmount) > 0
                    ? `${creditAmount} credits`
                    : "0 credits"}
                </div>
              </div>
            </div>
          </div>

          {/* Purchase Button */}
          <button
            type="button"
            onClick={handleOpenPaymentModal}
            disabled={processing || !creditAmount || isNaN(Number(creditAmount)) || Number(creditAmount) <= 0}
            className="w-full md:w-auto px-6 py-3 rounded-xl border border-rcn-brand/30 bg-rcn-brand/10 text-rcn-accent-dark font-extrabold text-sm shadow hover:bg-rcn-brand/15 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? "Processing..." : "Purchase Credits"}
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && creditAmount && !isNaN(Number(creditAmount)) && Number(creditAmount) > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(2,6,23,.25)] max-w-md w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold m-0">Payment Details</h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setProcessing(false);
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-rcn-muted hover:bg-slate-100 transition-colors"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              {/* Order Summary */}
              <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-[850] text-rcn-text">Credits</span>
                  <span className="text-sm font-black text-rcn-accent-dark">
                    {creditAmount} credits
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-[850] text-rcn-text">Price per Credit</span>
                  <span className="text-sm font-black text-rcn-text">${CREDIT_PRICE.toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-black text-rcn-text">Total</span>
                    <span className="text-xl font-black text-rcn-accent-dark">
                      ${calculatePrice(Number(creditAmount)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Details Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handlePurchase();
                }}
                className="space-y-4"
              >
                {/* Card Number */}
                <div>
                  <label className="block text-xs font-black text-rcn-muted mb-1.5">
                    Card Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={cardDetails.cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white outline-none text-[13px] font-normal text-rcn-text focus:border-rcn-brand/30 focus:ring-2 focus:ring-rcn-brand/10"
                    required
                  />
                </div>

                {/* Name on Card */}
                <div>
                  <label className="block text-xs font-black text-rcn-muted mb-1.5">
                    Name on Card <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={cardDetails.nameOnCard}
                    onChange={(e) => setCardDetails((prev) => ({ ...prev, nameOnCard: e.target.value }))}
                    placeholder="John Doe"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white outline-none text-[13px] font-normal text-rcn-text focus:border-rcn-brand/30 focus:ring-2 focus:ring-rcn-brand/10"
                    required
                  />
                </div>

                {/* Expiry and CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-rcn-muted mb-1.5">
                      Expiry Date <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={cardDetails.expiryMonth}
                        onChange={(e) => setCardDetails((prev) => ({ ...prev, expiryMonth: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white outline-none text-[13px] font-normal text-rcn-text focus:border-rcn-brand/30 focus:ring-2 focus:ring-rcn-brand/10"
                        required
                      >
                        <option value="">Month</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                          <option key={month} value={String(month).padStart(2, "0")}>
                            {String(month).padStart(2, "0")}
                          </option>
                        ))}
                      </select>
                      <select
                        value={cardDetails.expiryYear}
                        onChange={(e) => setCardDetails((prev) => ({ ...prev, expiryYear: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white outline-none text-[13px] font-normal text-rcn-text focus:border-rcn-brand/30 focus:ring-2 focus:ring-rcn-brand/10"
                        required
                      >
                        <option value="">Year</option>
                        {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                          <option key={year} value={String(year)}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-rcn-muted mb-1.5">
                      CVV <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={cardDetails.cvv}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                        setCardDetails((prev) => ({ ...prev, cvv: v }));
                      }}
                      placeholder="123"
                      maxLength={4}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white outline-none text-[13px] font-normal text-rcn-text focus:border-rcn-brand/30 focus:ring-2 focus:ring-rcn-brand/10"
                      required
                    />
                  </div>
                </div>

                {/* Zip Code */}
                <div>
                  <label className="block text-xs font-black text-rcn-muted mb-1.5">
                    Zip Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={cardDetails.zipCode}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 10);
                      setCardDetails((prev) => ({ ...prev, zipCode: v }));
                    }}
                    placeholder="12345"
                    maxLength={10}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white outline-none text-[13px] font-normal text-rcn-text focus:border-rcn-brand/30 focus:ring-2 focus:ring-rcn-brand/10"
                    required
                  />
                </div>

                {/* Payment Method Display */}
                <div className="bg-rcn-brand/5 rounded-xl p-3 border border-rcn-brand/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-rcn-muted">Payment Method</span>
                    <span className="text-xs font-black text-rcn-accent-dark">
                      {getPaymentMethodLabel(paymentMethod)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPaymentModal(false);
                      setProcessing(false);
                    }}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-rcn-text font-extrabold text-sm shadow hover:bg-slate-50 transition-colors"
                    disabled={processing}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-rcn-brand/30 bg-rcn-brand/10 text-rcn-accent-dark font-extrabold text-sm shadow hover:bg-rcn-brand/15 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? "Processing..." : `Pay $${calculatePrice(Number(creditAmount)).toFixed(2)}`}
                  </button>
                </div>

                {/* Security Notice */}
                <div className="pt-2 text-center">
                  <p className="text-[10px] text-rcn-muted m-0 flex items-center justify-center gap-1">
                    <span>🔒</span>
                    <span>Your payment information is secure and encrypted</span>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
