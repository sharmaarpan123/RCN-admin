"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components";

export interface ClaimReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (code: string) => Promise<void>;
  isPending?: boolean;
}

const INPUT_CLASS =
  "w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white outline-none text-[13px] font-normal text-rcn-text focus:border-rcn-brand/30 focus:ring-2 focus:ring-rcn-brand/10";

export function ClaimReferralModal({
  isOpen,
  onClose,
  onSubmit,
  isPending = false,
}: ClaimReferralModalProps) {
  const [code, setCode] = useState("");

  useEffect(() => {
    if (isOpen) {
      queueMicrotask(() => {
        setCode("");
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;
    await onSubmit(trimmed);
    onClose();
    setCode("");
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/55 flex items-center justify-center p-4 z-999"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      aria-hidden="false"
    >
      <div
        className="w-full max-w-md bg-white/98 border border-slate-200 rounded-[18px] shadow-[0_30px_80px_rgba(2,6,23,.35)] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Claim referral"
      >
        <div
          className="p-3.5 border-b border-rcn-brand/20 flex items-start justify-between gap-3"
          style={{
            background:
              "linear-gradient(90deg, rgba(15,107,58,.18), rgba(31,138,76,.12), rgba(31,138,76,.06))",
          }}
        >
          <div>
            <h3 className="m-0 text-sm font-black tracking-wide">
              Claim Referral
            </h3>
            <p className="m-0 mt-1.5 text-rcn-muted text-xs font-[850]">
              Enter the referral code to claim it to your receiver inbox.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="border border-slate-200 bg-white px-2.5 py-2 rounded-xl font-extrabold text-xs shadow-[0_8px_18px_rgba(2,6,23,.06)]"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-3.5 flex flex-col gap-3">
          <div>
            <label
              htmlFor="claim-code"
              className="block text-rcn-muted text-xs font-[850] leading-snug mb-1.5"
            >
              Referral code
            </label>
            <input
              id="claim-code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter referral code"
              className={INPUT_CLASS}
              autoComplete="off"
              disabled={isPending}
              aria-label="Referral code"
            />
          </div>

          <div className="flex gap-2.5 justify-end pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isPending || !code.trim()}
            >
              {isPending ? "Claiming…" : "Claim"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
