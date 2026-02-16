"use client";

import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import Modal from "@/components/Modal";
import { Button } from "@/components";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

const CARD_OPTIONS = {
  style: {
    base: {
      fontSize: "16px",
      color: "#0f172a",
      "::placeholder": { color: "#94a3b8" },
    },
    invalid: {
      color: "#dc2626",
    },
  },
};

interface StripeCardFormProps {
  onSuccess: (paymentMethodId: string) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

function StripeCardForm({ onSuccess, onCancel, isSubmitting }: StripeCardFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!stripe || !elements) return;
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError("Card form not ready.");
      return;
    }
    const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
    });
    if (stripeError) {
      setError(stripeError.message ?? "Card validation failed.");
      return;
    }
    if (paymentMethod?.id) {
      onSuccess(paymentMethod.id);
    } else {
      setError("Could not create payment method.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-3 rounded-xl border border-rcn-border bg-white">
        <CardElement options={CARD_OPTIONS} />
      </div>
      {error && (
        <p className="text-sm text-red-600 m-0" role="alert">
          {error}
        </p>
      )}
      <div className="flex gap-2.5 justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={!stripe || !elements || isSubmitting}
        >
          {isSubmitting ? "Processing…" : "Confirm card"}
        </Button>
      </div>
    </form>
  );
}

export interface StripeCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentMethodId: string) => void;
  isSubmitting?: boolean;
  /** Optional description (e.g. for wallet vs referral). */
  description?: string;
}

export function StripeCardModal({
  isOpen,
  onClose,
  onSuccess,
  isSubmitting = false,
  description = "Enter your credit or debit card details to pay for this referral.",
}: StripeCardModalProps) {
  if (!stripePromise) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} maxWidth="440px">
        <div className="p-4">
          <h3 className="m-0 text-base font-semibold mb-2">Card payment</h3>
          <p className="m-0 text-sm text-rcn-muted">
            Stripe is not configured. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in your environment.
          </p>
          <div className="flex justify-end mt-4">
            <Button type="button" variant="primary" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="440px">
      <div className="p-4">
        <h3 className="m-0 text-base font-semibold mb-2 flex items-center gap-2">
          <span className="text-xl">💳</span>
          Enter card details
        </h3>
        <p className="m-0 text-sm text-rcn-muted mb-4">{description}</p>
        <Elements stripe={stripePromise}>
          <StripeCardForm
            onSuccess={onSuccess}
            onCancel={onClose}
            isSubmitting={isSubmitting}
          />
        </Elements>
      </div>
    </Modal>
  );
}
