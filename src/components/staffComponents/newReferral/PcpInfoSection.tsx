"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { SectionHeader } from "./SectionHeader";
import { PhoneInputField } from "@/components";
import type { ReferralFormValues } from "./referralFormSchema";

const inputClass =
  "w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12";

export function PcpInfoSection() {
  const { register, watch, setValue } = useFormContext<ReferralFormValues>();

  const primaryCareDialCode = watch("primary_care_dial_code") ?? "";
  const primaryCarePhone = watch("primary_care_phone_number") ?? "";
  const primaryCarePhoneValue =
    (primaryCareDialCode ?? "") + (primaryCarePhone ?? "").replace(/\D/g, "");

  const handlePrimaryCarePhoneChange = (value: string, country: { dialCode: string }) => {
    const code = String(country?.dialCode ?? "+1");
    setValue("primary_care_dial_code", code, { shouldValidate: true });
    setValue("primary_care_phone_number", value.slice(code.length) || "", { shouldValidate: true });
  };

  return (
    <section
      id="pcp-info"
      className="bg-white border border-rcn-border rounded-2xl shadow-rcn p-4.5 mb-3.5 overflow-hidden relative"
    >
      <SectionHeader
        title="Primary Care Physician Information"
        subtitle="Enter patient's primary care physician details"
        badge="Optional"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="md:col-span-2">
          <label className="block text-xs text-rcn-muted font-semibold mb-1.5">Name</label>
          <input
            type="text"
            {...register("primary_care_name")}
            placeholder="PCP full name"
            className={inputClass}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs text-rcn-muted font-semibold mb-1.5">Address</label>
          <input
            type="text"
            {...register("primary_care_address")}
            placeholder="Street, City, State, ZIP"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs text-rcn-muted font-semibold mb-1.5">Tel</label>
          <PhoneInputField
            value={primaryCarePhoneValue}
            onChange={handlePrimaryCarePhoneChange}
            placeholder="(xxx) xxx-xxxx"
          />
        </div>
        <div>
          <label className="block text-xs text-rcn-muted font-semibold mb-1.5">Fax</label>
          <input
            type="tel"
            {...register("primary_care_fax")}
            placeholder="(xxx) xxx-xxxx"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs text-rcn-muted font-semibold mb-1.5">Email</label>
          <input
            type="email"
            {...register("primary_care_email")}
            placeholder="pcp@example.com"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs text-rcn-muted font-semibold mb-1.5">NPI</label>
          <input
            type="text"
            {...register("primary_care_npi")}
            placeholder="NPI number"
            className={inputClass}
          />
        </div>
      </div>
    </section>
  );
}
