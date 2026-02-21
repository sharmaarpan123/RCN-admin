"use client";

import { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { SectionHeader } from "./SectionHeader";
import { PhoneInputField } from "@/components";
import type { ReferralFormValues } from "./referralFormSchema";
import { useStaffAuthLoginUser } from "@/store/slices/Auth/hooks";

const inputClass =
  "w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12";

const disabledInputClass =
  "w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-slate-50 text-rcn-muted text-sm cursor-not-allowed";

export function SenderInfoSection() {
  const { register, setValue } = useFormContext<ReferralFormValues>();
  const { loginUser } = useStaffAuthLoginUser();



  const senderDialCode = useWatch({ name: "sender_dial_code" }) ?? "";
  const senderPhone = useWatch({ name: "sender_phone_number" }) ?? "";
  const senderPhoneValue = (senderDialCode ?? "") + (senderPhone ?? "").replace(/\D/g, "");

  useEffect(() => {
    if (!loginUser?.organization) return;
    const org = loginUser.organization;
    setValue("sender_name", [loginUser.first_name, loginUser.last_name].filter(Boolean).join(" ").trim(), {
      shouldValidate: true,
    });
    setValue("facility_name", org.name ?? "", { shouldValidate: true });
    const addressParts = [org.street, org.city, org.state, org.zip_code].filter(Boolean);
    setValue("facility_address", addressParts.join(", "), { shouldValidate: true });
    setValue("sender_email", org.email ?? "", { shouldValidate: true });
    setValue("sender_dial_code", org.dial_code ?? "+1", { shouldValidate: true });
    setValue("sender_phone_number", (org.phone_number ?? "").replace(/\D/g, ""), { shouldValidate: true });
    setValue("sender_fax_number", "", { shouldValidate: true });
  }, [loginUser, setValue]);


  const isDisabled = true;

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
          <input
            type="text"
            {...register("sender_name")}
            placeholder="Auto-filled"
            disabled={isDisabled}
            className={isDisabled ? disabledInputClass : inputClass}
          />
        </div>
        <div>
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5">Facility Name</label>
          <input
            type="text"
            {...register("facility_name")}
            placeholder="Auto-filled"
            disabled={isDisabled}
            className={isDisabled ? disabledInputClass : inputClass}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5">Facility Address</label>
          <input
            type="text"
            {...register("facility_address")}
            placeholder="Auto-filled"
            disabled={isDisabled}
            className={isDisabled ? disabledInputClass : inputClass}
          />
        </div>
        <div>
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5">Email</label>
          <input
            type="email"
            {...register("sender_email")}
            placeholder="Auto-filled"
            disabled={isDisabled}
            className={isDisabled ? disabledInputClass : inputClass}
          />
        </div>
        <div>
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5">Phone Number</label>
          <PhoneInputField
            value={senderPhoneValue}
            onChange={() => { }}
            placeholder="(xxx) xxx-xxxx"
            inputProps={{ disabled: isDisabled, readOnly: isDisabled }}
            containerClass={isDisabled ? "opacity-90 pointer-events-none" : ""}
          />
        </div>
        <div>
          <label className="block text-xs text-rcn-muted font-[850] mb-1.5">Fax Number</label>
          <input
            type="text"
            {...register("sender_fax_number")}
            placeholder="Auto-filled"
            disabled={isDisabled}
            className={isDisabled ? disabledInputClass : inputClass}
          />
        </div>
      </div>
    </section>
  );
}
