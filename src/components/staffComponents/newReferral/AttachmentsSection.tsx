"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { SectionHeader } from "./SectionHeader";
import type { ReferralFormValues } from "./referralFormSchema";

const inputClass =
  "w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12";

const ATTACHMENT_FIELDS: { key: keyof ReferralFormValues; label: string }[] = [
  { key: "face_sheet", label: "Face Sheet (URL)" },
  { key: "medication_list", label: "Medication List (URL)" },
  { key: "discharge_summary", label: "Discharge Summary (URL)" },
  { key: "signed_order", label: "Signed Order (URL)" },
  { key: "history_or_physical", label: "History & Physical (URL)" },
  { key: "progress_notes", label: "Progress Notes (URL)" },
];

function splitUrls(s: string): string[] {
  return (s || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

export function AttachmentsSection() {
  const { register, watch, setValue } = useFormContext<ReferralFormValues>();
  const wound_photos = watch("wound_photos") ?? [];
  const other_documents = watch("other_documents") ?? [];

  return (
    <section
      id="attachments"
      className="bg-white border border-rcn-border rounded-2xl shadow-rcn p-4.5 mb-3.5 overflow-hidden relative"
    >
      <SectionHeader
        title="Attached Documents (Sender)"
        subtitle="URLs for supporting documents (upload flow can set these later)"
        badge="Optional"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {ATTACHMENT_FIELDS.map(({ key, label }) => (
          <div key={key}>
            <label className="block text-xs text-rcn-muted font-[850] mb-1.5">{label}</label>
            <input
              type="url"
              {...register(key as "face_sheet")}
              placeholder="https://..."
              className={inputClass}
            />
          </div>
        ))}
        <div className="md:col-span-2">
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
            Wound Photos (comma-separated URLs)
          </label>
          <input
            type="text"
            value={Array.isArray(wound_photos) ? wound_photos.join(", ") : ""}
            onChange={(e) =>
              setValue("wound_photos", splitUrls(e.target.value), { shouldValidate: true })
            }
            placeholder="https://... , https://..."
            className={inputClass}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
            Other Documents (comma-separated URLs)
          </label>
          <input
            type="text"
            value={Array.isArray(other_documents) ? other_documents.join(", ") : ""}
            onChange={(e) =>
              setValue("other_documents", splitUrls(e.target.value), { shouldValidate: true })
            }
            placeholder="https://... , https://..."
            className={inputClass}
          />
        </div>
      </div>
    </section>
  );
}
