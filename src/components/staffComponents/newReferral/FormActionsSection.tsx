"use client";

import { Button } from "@/components";

export function FormActionsSection({ isSubmitting }: { isSubmitting: boolean }) {
  
  

  return (
    <section
      id="form-actions"
      className="flex gap-2.5 flex-wrap justify-end p-3 border border-rcn-border rounded-2xl bg-gradient-to-b from-white to-[#f6fbf7] shadow-rcn mb-3.5"
    >
      {/* <Button
        type="button"
        variant="secondary"
        size="md"
        className="border border-rcn-border bg-white px-3 py-2.5 rounded-xl font-extrabold text-xs shadow"
      >
        Save Draft
      </Button> */}
      <Button
        type="submit"
        variant="primary"
        size="md"
        disabled={isSubmitting}
        className="border border-rcn-brand/30  text-rcn-accent-dark px-3 py-2.5 rounded-xl font-extrabold text-xs shadow"
      >
        {isSubmitting ? "Submitting…" : "Submit Referral"}
      </Button>
    </section>
  );
}
