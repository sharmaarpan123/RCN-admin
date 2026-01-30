"use client";

import React from "react";

interface FormActionsSectionProps {
  onSaveDraft: () => void;
  onSubmit: () => void;
}

export function FormActionsSection({ onSaveDraft, onSubmit }: FormActionsSectionProps) {
  return (
    <section
      id="form-actions"
      className="flex gap-2.5 flex-wrap justify-end p-3 border border-rcn-border rounded-2xl bg-gradient-to-b from-white to-[#f6fbf7] shadow-rcn mb-3.5"
    >
      <button
        type="button"
        onClick={onSaveDraft}
        className="border border-rcn-border bg-white px-3 py-2.5 rounded-xl font-extrabold text-xs shadow"
      >
        Save Draft
      </button>
      <button
        type="button"
        onClick={onSubmit}
        className="border border-rcn-brand/30 bg-rcn-brand/10 text-rcn-accent-dark px-3 py-2.5 rounded-xl font-extrabold text-xs shadow"
      >
        Submit Referral
      </button>
    </section>
  );
}
