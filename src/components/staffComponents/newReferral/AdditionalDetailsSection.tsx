"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { SectionHeader } from "./SectionHeader";
import { PhoneInputField } from "@/components";
import type { ReferralFormValues } from "./referralFormSchema";
import { useFormState } from "react-hook-form";

const inputClass =
  "w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12";

export function AdditionalDetailsSection() {
  const { register, watch, setValue } = useFormContext<ReferralFormValues>();
  const { errors } = useFormState<ReferralFormValues>();

  const patientDialCode = watch("patient_dial_code") ?? "";
  const patientPhoneNumber = watch("patient_phone_number") ?? "";
  const patientPhoneValue =
    (patientDialCode ?? "") + (patientPhoneNumber ?? "").replace(/\D/g, "");

  const handlePatientPhoneChange = (value: string, country: { dialCode: string }) => {
    const code = String(country?.dialCode ?? "+1");
    setValue("patient_dial_code", code, { shouldValidate: true });
    setValue("patient_phone_number", value.slice(code.length) || "", { shouldValidate: true });
  };

  return (
    <section
      id="additional-details"
      className="bg-white border border-rcn-border rounded-2xl shadow-rcn p-4.5 mb-3.5 overflow-hidden relative"
    >
      <SectionHeader
        title="Additional Patient Details"
        subtitle="Visible to receiver after payment/unlock"
        badge="Phone required"
      />

      <div className="border border-rcn-border/60 bg-[#eef8f1] border-[#cfe6d6] rounded-[14px] p-3 mb-3">
        <p className="m-0 text-sm text-rcn-text mb-2">
          These additional details will be visible to the Referral Receiver after payment/unlock
          (unless the Referral Sender purchased the referral, in which case the Receiver can view
          without paying).
        </p>
        <p className="m-0 text-sm text-rcn-text mb-2">
          Without unlocking additional details, the receiver can still verify the patient&apos;s
          insurance and choose to accept or decline the referral. This helps ensure the receiver
          does not incur costs for services that are not covered or not appropriate.
        </p>
        <p className="m-0 text-sm text-rcn-text">
          The communication channel (chat/messaging) will remain closed until the receiver pays to
          unlock the referral, at which point full details become available and the receiver can
          communicate with the sender.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-rcn-muted font-semibold mb-1.5">
            Phone Number <span className="text-rcn-danger font-black">*</span>
          </label>
          <PhoneInputField
            value={patientPhoneValue}
            onChange={handlePatientPhoneChange}
            hasError={!!errors.patient_phone_number}
            placeholder="(xxx) xxx-xxxx"
          />
          {errors.patient_phone_number && (
            <p className="text-xs text-rcn-danger mt-1 m-0">{errors.patient_phone_number.message}</p>
          )}
        </div>
        <div>
          <label className="block text-xs text-rcn-muted font-semibold mb-1.5">
            Primary Language
          </label>
          <input
            type="text"
            {...register("primary_language")}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs text-rcn-muted font-semibold mb-1.5">
            Social Security Number
          </label>
          <input
            type="text"
            {...register("social_security_number")}
            placeholder="XXX-XX-XXXX"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs text-rcn-muted font-semibold mb-1.5">
            Power of attorney
          </label>
          <input
            type="text"
            {...register("power_of_attorney")}
            className={inputClass}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs text-rcn-muted font-semibold mb-1.5">
            Other Information
          </label>
          <textarea
            {...register("other_information")}
            placeholder="Additional details visible after receiver unlock..."
            className={`${inputClass} min-h-[95px] resize-y`}
          />
        </div>
      </div>
    </section>
  );
}
