"use client";

import { useFormContext } from "react-hook-form";
import { SectionHeader } from "./SectionHeader";
import { PhoneInputField } from "@/components";
import type { ReferralFormValues } from "./referralFormSchema";

const inputClass =
  "w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12";

export function SenderInfoSection() {
  const { register, watch, setValue } = useFormContext<ReferralFormValues>();

  const senderDialCode = watch("sender_dial_code") ?? "";
  const senderPhone = watch("sender_phone_number") ?? "";
  const senderPhoneValue = (senderDialCode ?? "") + (senderPhone ?? "").replace(/\D/g, "");

  const handleSenderPhoneChange = (value: string, country: { dialCode: string }) => {
    const code = String(country?.dialCode ?? "+1");
    setValue("sender_dial_code", code, { shouldValidate: true });
    setValue("sender_phone_number", value.slice(code.length) || "", { shouldValidate: true });
  };

  return (
    <section
      id="sender-info"
      className="bg-white border border-rcn-border rounded-2xl shadow-rcn p-4.5 mb-3.5 overflow-hidden relative"
    >
      <SectionHeader
        title="Person/Facility Sending Referral"
        subtitle="Automatically included by the system"
        badge="Auto-filled"
      />
      <p className="text-xs text-rcn-muted mb-3">
        Facility name, address, email, phone number, and fax number are auto-filled.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5">Sender Name</label>
          <input type="text" {...register("sender_name")} placeholder="Auto-filled" className={inputClass} />
        </div>
        <div>
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5">Facility Name</label>
          <input type="text" {...register("facility_name")} placeholder="Auto-filled" className={inputClass} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5">Facility Address</label>
          <input type="text" {...register("facility_address")} placeholder="Auto-filled" className={inputClass} />
        </div>
        <div>
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5">Email</label>
          <input type="email" {...register("sender_email")} placeholder="Auto-filled" className={inputClass} />
        </div>
        <div>
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5">Phone Number</label>
          <PhoneInputField
            value={senderPhoneValue}
            onChange={handleSenderPhoneChange}
            placeholder="(xxx) xxx-xxxx"
          />
        </div>
        <div>
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5">Fax Number</label>
          <input type="text" {...register("sender_fax_number")} placeholder="Auto-filled" className={inputClass} />
        </div>
      </div>
    </section>
  );
}
