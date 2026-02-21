"use client";

import React, { useState, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { SectionHeader } from "./SectionHeader";
import type { ReferralFormValues } from "./referralFormSchema";
import { uploadFileApi } from "@/apis/ApiCalls";
import { catchAsync, checkResponse } from "@/utils/commonFunc";
import { toastError } from "@/utils/toast";
import { PreviewFile } from "@/components";

const zoneClass =
  "w-full min-h-[44px] px-3 py-2.5 relative rounded-xl border border-rcn-border border-dashed bg-rcn-brand/5 outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12 flex items-center justify-center gap-2 flex-wrap";

const ATTACHMENT_FIELDS: { key: keyof ReferralFormValues; label: string }[] = [
  { key: "face_sheet", label: "Face Sheet" },
  { key: "medication_list", label: "Medication List" },
  { key: "discharge_summary", label: "Discharge Summary" },
  { key: "signed_order", label: "Signed Order" },
  { key: "history_or_physical", label: "History & Physical" },
  { key: "progress_notes", label: "Progress Notes" },
];

function getUploadResponseUrl(res: unknown): string {
  const data = res as { data?: { url?: string }; url?: string };
  return data?.data?.url ?? data?.url ?? "";
}

type SingleUrlKey =
  | "face_sheet"
  | "medication_list"
  | "discharge_summary"
  | "signed_order"
  | "history_or_physical"
  | "progress_notes";

export function AttachmentsSection() {
  const { watch, setValue } = useFormContext<ReferralFormValues>();
  const wound_photos = watch("wound_photos") ?? [];
  const other_documents = watch("other_documents") ?? [];

  const [uploadingFields, setUploadingFields] = useState<Record<string, boolean>>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const setUploading = (key: string, value: boolean) => {
    setUploadingFields((prev) => ({ ...prev, [key]: value }));
  };

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const woundPhotoInputRef = useRef<HTMLInputElement | null>(null);
  const otherDocsInputRef = useRef<HTMLInputElement | null>(null);

  const handleSingleUpload = (key: SingleUrlKey, file: File) => {
    setUploading(key, true);
    catchAsync(async () => {
      const res = await uploadFileApi(file);
      const url = getUploadResponseUrl(res?.data);
      if (url) {
        setValue(key, url, { shouldValidate: true });
        checkResponse({ res });
      } else {
        toastError("Upload succeeded but no URL was returned.");
      }
    })().finally(() => {
      setUploading(key, false);
    });
  };

  const handleMultiUpload = (
    field: "wound_photos" | "other_documents",
    file: File
  ) => {
    setUploading(field, true);
    catchAsync(async () => {
      const res = await uploadFileApi(file);
      const url = getUploadResponseUrl(res?.data);
      if (url) {
        const current = field === "wound_photos" ? wound_photos : other_documents;
        const arr = Array.isArray(current) ? [...current] : [];
        arr.push(url);
        setValue(field, arr, { shouldValidate: true });
        checkResponse({ res });
      } else {
        toastError("Upload succeeded but no URL was returned.");
      }
    })().finally(() => {
      setUploading(field, false);
    });
  };

  const removeUrlFromArray = (
    field: "wound_photos" | "other_documents",
    index: number
  ) => {
    const current = field === "wound_photos" ? wound_photos : other_documents;
    const arr = Array.isArray(current) ? [...current] : [];
    arr.splice(index, 1);
    setValue(field, arr, { shouldValidate: true });
  };

  const woundArr = Array.isArray(wound_photos) ? wound_photos : [];
  const otherArr = Array.isArray(other_documents) ? other_documents : [];

  return (
    <section
      id="attachments"
      className="bg-white border border-rcn-border rounded-2xl shadow-rcn p-4.5 mb-3.5 overflow-hidden relative"
    >
      <SectionHeader
        title="Attached Documents (Sender)"
        subtitle="Upload supporting documents. Each upload stores a URL for the referral."
        badge="Optional"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {ATTACHMENT_FIELDS.map(({ key, label }) => {
          const value = watch(key as SingleUrlKey) as string | undefined;
          const currentUrl = (value ?? "").trim();
          const isUploading = uploadingFields[key] === true;
          return (
            <div key={key} className="relative">
              <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
                {label}
              </label>
              <div className="relative">

                <label
                  className={zoneClass}

                  aria-label={`Upload ${label}`}
                  htmlFor={key}
                >
                  <input
                    ref={(el) => {
                      fileInputRefs.current[key] = el;
                    }}
                    type="file"
                    name={key}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                    disabled={isUploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleSingleUpload(key as SingleUrlKey, file);
                      e.target.value = "";
                    }}
                    aria-label={`Upload ${label}`}
                  />
                  {isUploading ? (
                    <span className="text-rcn-muted flex items-center gap-2">
                      <span className="inline-block w-4 h-4 border-2 border-rcn-brand border-t-transparent rounded-full animate-spin" />
                      Uploading…
                    </span>
                  ) : currentUrl ? (
                    <span className="text-rcn-brand truncate max-w-full">
                      Uploaded ✓
                    </span>
                  ) : (
                    <span className="text-rcn-muted">
                      Choose file to upload
                    </span>
                  )}
                </label>
                {currentUrl && !isUploading && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewUrl(currentUrl);
                    }}
                    className="text-xs text-rcn-brand mt-1 block truncate text-left hover:underline focus:outline-none focus:ring-0"
                  >
                    View file
                  </button>
                )}
              </div>
            </div>
          );
        })}

        <div className="md:col-span-2">
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
            Wound Photos
          </label>
          <div className="relative">

            <label
              className={zoneClass + " min-h-[44px]"}
              htmlFor="wound_photos"
            >
              <input
                name="wound_photos"
                id="wound_photos"
                ref={woundPhotoInputRef}
                type="file"
                className="absolute inset-0 w-full min-h-[44px] opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed rounded-xl"
                disabled={uploadingFields["wound_photos"] === true}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleMultiUpload("wound_photos", file);
                  e.target.value = "";
                }}
                aria-label="Upload wound photo"
              />
              {uploadingFields["wound_photos"] ? (
                <span className="text-rcn-muted flex items-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-rcn-brand border-t-transparent rounded-full animate-spin" />
                  Uploading…
                </span>
              ) : (
                <span className="text-rcn-muted">
                  Choose file to add wound photo
                </span>
              )}
            </label>
            {woundArr.length > 0 && (
              <ul className="mt-2 space-y-1">
                {woundArr.map((url, i) => (
                  <li key={i} className="flex items-center justify-between gap-2 text-xs">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewUrl(url ?? "");
                      }}
                      className="text-xs text-rcn-brand mt-1 block truncate text-left hover:underline focus:outline-none focus:ring-0"
                    >
                     View Photo {i + 1}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeUrlFromArray("wound_photos", i)}
                      className="text-red-600 hover:underline shrink-0"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5">
            Other Documents
          </label>
          <div className="relative">

            <label
              htmlFor="other_documents"
              className={zoneClass + " min-h-[44px]"}

              tabIndex={0}
              aria-label="Upload other document"
            >
              <input
                name="other_documents"
                id="other_documents"
                ref={otherDocsInputRef}
                type="file"
                className="absolute inset-0 w-full min-h-[44px] opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed rounded-xl"
                disabled={uploadingFields["other_documents"] === true}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleMultiUpload("other_documents", file);
                  e.target.value = "";
                }}
                aria-label="Upload other document"
              />
              {uploadingFields["other_documents"] ? (
                <span className="text-rcn-muted flex items-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-rcn-brand border-t-transparent rounded-full animate-spin" />
                  Uploading…
                </span>
              ) : (
                <span className="text-rcn-muted">
                  Choose file to add document
                </span>
              )}
            </label>
            {otherArr.length > 0 && (
              <ul className="mt-2 space-y-1">
                {otherArr.map((url, i) => (
                  <li key={i} className="flex items-center justify-between gap-2 text-xs">

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewUrl(url ?? "");
                      }}
                      className="text-xs text-rcn-brand mt-1 block truncate text-left hover:underline focus:outline-none focus:ring-0"
                    >
                      View Document 
                    </button>
                    <button
                      type="button"
                      onClick={() => removeUrlFromArray("other_documents", i)}
                      className="text-red-600 hover:underline shrink-0"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <PreviewFile
        url={previewUrl ?? ""}
        isOpen={!!previewUrl}
        onClose={() => setPreviewUrl(null)}
      />
    </section>
  );
}
